import {Component, computed, inject, Input, OnChanges, OnInit, signal, SimpleChanges} from '@angular/core';
import {
  AcaoJogoDTO,
  JogadorDTO,
  PartidaCreateDTO,
  PartidaResponseDTO,
  PartidasService,
  TimeResponseDTO,
  TimesService
} from '../../api';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIcon} from '@angular/material/icon';
import {EventoControllerService} from '../../api';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from '@angular/material/card';
import {MatDivider} from '@angular/material/divider';
import {MatButton} from '@angular/material/button';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-matches',
  imports: [
    DatePipe,
    MatIcon,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardContent,
    MatDivider,
    MatCardActions,
    MatButton,
  ],
  templateUrl: './event-matches.component.html',
  styleUrl: './event-matches.component.css'
})
export class EventMatchesComponent implements OnInit, OnChanges {
  @Input() eventoId!: number | undefined

  ngOnInit() {
    console.log(this.eventoId)
    this.carregarDadosIniciais();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventoId'] && this.eventoId) {
      this.carregarDadosIniciais();
    }
  }

  private partidaService = inject(PartidasService);
  private timeService = inject(TimesService);
  private snackbar = inject(MatSnackBar);
  private eventoService = inject(EventoControllerService);

  partidaAtual = signal<PartidaResponseDTO | null>(null);
  times = signal<TimeResponseDTO[]>([]);

  jogadoresTimeA = signal<JogadorDTO[]>([]);
  jogadoresTimeB = signal<JogadorDTO[]>([]);

  partidasNaoIniciadas = signal<PartidaResponseDTO[]>([]);
  partidasFinalizadas = signal<PartidaResponseDTO[]>([]);

  todasPartidas = signal<PartidaResponseDTO[]>([]);
  totalPartidasDefinidas = signal<number | null>(null);
  limitePartidasAtingido = computed(() => {
    const total = this.totalPartidasDefinidas();
    const atuais = this.todasPartidas().length;

    if(total === null || total === undefined) return false;

    return atuais >= total;
  });


  carregarDadosIniciais() {
    if(!this.eventoId) return;

    this.timeService.listarPorEvento1(this.eventoId).subscribe({
      next: (data) => {
        console.log(data)
        this.times.set(data)
      },
      error: err => console.error(err)
    });

    this.carregarPartidasDoEvento();
    
    // buscar informações do evento para obter o limite de partidas
    this.eventoService.buscarEvento(this.eventoId).subscribe({
      next: (evento) => {
        this.totalPartidasDefinidas.set(evento?.totalPartidasDefinidas ?? null);
      },
      error: err => console.error(err)
    });
  }

  carregarPartidasDoEvento() {
    if (!this.eventoId) return;
    this.partidaService.listarPorEvento(this.eventoId).subscribe({
      next: (partidas) => {
        // separar listas por status
        this.todasPartidas.set(partidas);
        const naoIniciadas = partidas.filter(p => p.status === 'AGUARDANDO_INICIO');
        const emAndamento = partidas.find(p => p.status === 'EM_ANDAMENTO');
        const finalizadas = partidas.filter(p => p.status === 'JOGADA');

        this.partidasNaoIniciadas.set(naoIniciadas);
        this.partidasFinalizadas.set(finalizadas);

        if (emAndamento) {
          this.configurarPartidaAtiva(emAndamento);
        } else {
          this.partidaAtual.set(null);
        }
      },
      error: (err) => console.error(err)
    });
  }

  configurarPartidaAtiva(partida: PartidaResponseDTO) {
    if(!this.eventoId) return;
    this.partidaAtual.set(partida);

    this.timeService.listarPorEvento1(this.eventoId).subscribe(timesAtualizados => {
      this.times.set(timesAtualizados);

      const timeA = timesAtualizados.find(t => t.id === partida.timeAId);
      const timeB = timesAtualizados.find(t => t.id === partida.timeBId);

      if (timeA) this.jogadoresTimeA.set(timeA.jogadores || []);
      if (timeB) this.jogadoresTimeB.set(timeB.jogadores || []);
    })
  }

  iniciarPartidaInicial() {
    if(!this.eventoId) return;

    if (this.limitePartidasAtingido()) {
      this.mostrarMensagem('Limite de partidas atingido para este evento.');
      return;
    }

    const listaTimes = this.times();
    const timesJogaveis = listaTimes.filter(t => !t.timeDeEspera);

    if (timesJogaveis.length < 2) {
      this.mostrarMensagem('Não há times suficientes para iniciar uma partida.');
      return;
    }

    const timeA = timesJogaveis[0];
    const timeB = timesJogaveis[1];

    const dto: PartidaCreateDTO = {
      timeAId: timeA.id!,
      timeBId: timeB.id!
    };

    this.partidaService.criarPartida(this.eventoId, dto).subscribe({
      next: (partidaCriada) => {
        this.partidaService.iniciarPartida(partidaCriada.id!).subscribe({
          next: (partidaIniciada) => {
            console.log('Iniciando partida criada', partidaCriada);
            this.mostrarMensagem('Partida iniciada!');
            this.configurarPartidaAtiva(partidaIniciada);
            // atualizar listas/flag após criar e iniciar
            this.carregarPartidasDoEvento();
          }
        });
      },
      error: (err) => this.mostrarMensagem('Erro ao criar partida.')
    });
  }

  registrarAcao(jogador: JogadorDTO, tipo: 'GOL' | 'ASSISTENCIA' | 'DEFESA') {
    const partida = this.partidaAtual();
    if (!partida) return;

    const dto: AcaoJogoDTO = {
      jogadorId: jogador.id!,
      tipoAcao: tipo
    };

    this.partidaService.registrarAcao1(partida.id!, dto).subscribe({
      next: () => {
        this.mostrarMensagem(`${tipo} registrado para ${jogador.nome}!`);
        this.atualizarPlacar(partida.id!);
      },
      error: (err) => this.mostrarMensagem('Erro ao registrar ação.')
    });
  }

  removerAcao(jogador: JogadorDTO, tipo: 'GOL' | 'ASSISTENCIA' | 'DEFESA') {
    const partida = this.partidaAtual();
    if (!partida) return;

    const dto: AcaoJogoDTO = {
      jogadorId: jogador.id!,
      tipoAcao: tipo as any
    };

    this.partidaService.removerAcao(partida.id!, dto).subscribe({
      next: () => {
        this.mostrarMensagem(`${tipo} removido para ${jogador.nome}!`);
        this.atualizarPlacar(partida.id!);
      },
      error: (err) => this.mostrarMensagem('Erro ao remover ação.')
    });
  }

  private atualizarPlacar(partidaId: number) {
    if(!this.eventoId) return;
    this.partidaService.listarPorEvento(this.eventoId).subscribe(partidas => {
      const p = partidas?.find(x => x.id === partidaId);
      if (p) this.partidaAtual.set(p);
    });
  }

  finalizarPartida() {
    const partida = this.partidaAtual();
    if (!partida) return;

    if (!confirm('Deseja realmente finalizar a partida? O rodízio será aplicado.')) return;

    this.partidaService.finalizarPartida(partida.id!).subscribe({
      next: (partidaFinalizada) => {
        this.mostrarMensagem(`Partida finalizada! Vencedor mantido.`);
        this.partidaAtual.set(null);
        this.carregarDadosIniciais();
      },
      error: (err) => this.mostrarMensagem('Erro ao finalizar partida.')
    });
  }

  private mostrarMensagem(msg: string) {
    this.snackbar.open(msg, 'Fechar', { duration: 3000 });
  }
}
