import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog'; // Import necessário
import { MatSnackBar } from '@angular/material/snack-bar'; // Import opcional mas recomendado
import { MatTooltipModule } from '@angular/material/tooltip'; // Adicionado para os tooltips dos botões

// Services & Models
import { EventoControllerService } from '../../api/api/eventoController.service';
import { InscricaoControllerService } from '../../api/api/inscricaoController.service';
import { EventoResponseDTO } from '../../api/model/eventoResponseDTO';
import { LanguageService } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

// Utils
import { finalize } from 'rxjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule // Adicionado aos imports
  ],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css'
})
export class MyEventsComponent implements OnInit {
  // Injeções de Dependência
  private eventoService = inject(EventoControllerService);
  private inscricaoService = inject(InscricaoControllerService);
  private authService = inject(AuthService);
  private router = inject(Router);
  // ADICIONADO: Injeção do MatDialog e MatSnackBar
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  public langService = inject(LanguageService);

  // --- SIGNALS DE DADOS ---
  // Listas originais
  eventosUsuario = signal<EventoResponseDTO[]>([]);
  eventosProximos = signal<EventoResponseDTO[]>([]);
  eventosInscritos = signal<EventoResponseDTO[]>([]);
  eventosFinalizados = signal<EventoResponseDTO[]>([]);

  // Listas filtradas (para exibição na tela)
  eventosUsuarioFiltrados = signal<EventoResponseDTO[]>([]);
  eventosProximosFiltrados = signal<EventoResponseDTO[]>([]);
  eventosInscritosFiltrados = signal<EventoResponseDTO[]>([]);
  eventosFinalizadosFiltrados = signal<EventoResponseDTO[]>([]);

  // Estado da UI
  isLoading = signal<boolean>(true);
  error = signal<string>('');
  selectedTabIndex = signal<number>(0);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadAllEvents();
  }

  // --- CARREGAMENTO DE DADOS ---
  loadAllEvents(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.eventoService.listarEventos()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: async (eventos) => {
          let eventosArray: EventoResponseDTO[] = [];

          if(eventos instanceof Blob) {
            const blobText = await eventos.text();
            eventosArray = JSON.parse(blobText);
          } else {
            eventosArray = eventos;
          }

          const now = dayjs();

          // Separa eventos ativos (futuros/presentes) dos finalizados (passados)
          const eventosAtivos = this.sortEventsByDate(
            eventosArray.filter(e => {
              const dataEvento = dayjs(e.dataHorario);
              // Evento é ativo se a data é futura ou se o status é ATIVO
              return dataEvento.isAfter(now) || (e.status === 'ATIVO' && dataEvento.isSame(now, 'day'));
            })
          );
          const eventosFinalizadosUsuario = this.sortEventsByDate(
            eventosArray.filter(e => {
              const dataEvento = dayjs(e.dataHorario);
              // Evento é finalizado se a data já passou ou se o status é FINALIZADO
              return dataEvento.isBefore(now) || e.status === 'FINALIZADO';
            })
          );

          this.eventosUsuario.set(eventosAtivos);
          this.eventosUsuarioFiltrados.set(eventosAtivos);

          this.loadNearbyEvents();
          
          // Carregar inscrições verificando TODOS os eventos (não apenas os do usuário)
          this.loadInscricoesFromAllEvents(eventosFinalizadosUsuario);
        },
        error: (error) => {
          console.error('Erro ao carregar eventos:', error);
          this.error.set('Erro ao carregar eventos');
        }
      });
  }

  loadNearbyEvents(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          (this.eventoService as any).listarEventosProximos(lat, lon, 50).subscribe({
            next: async (eventos: any) => {
              let eventosArray: EventoResponseDTO[] = [];

              // Verificar se a resposta é um Blob e converter para array
              if (eventos instanceof Blob) {
                const blobText = await eventos.text();
                eventosArray = JSON.parse(blobText);
              } else {
                eventosArray = eventos;
              }

              // Filtrar apenas eventos que não foram criados pelo usuário
              const eventosOutrosUsuarios = this.sortEventsByDate(
                eventosArray.filter(e => {
                  const isUsuarioEvento = this.eventosUsuario().some(eu => eu.id === e.id);
                  return !isUsuarioEvento;
                })
              );

              this.eventosProximos.set(eventosOutrosUsuarios);
              this.eventosProximosFiltrados.set(eventosOutrosUsuarios);
            },
            error: (err: any) => console.error('Erro ao carregar eventos próximos', err)
          });
        },
        (error) => console.error('Erro ao obter localização:', error)
      );
    }
  }

  loadInscricoesFromAllEvents(eventosFinalizadosUsuario: EventoResponseDTO[]): void {
    // Buscar eventos próximos (que não são do usuário) para verificar inscrições
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Buscar eventos próximos com um raio grande para pegar todos os eventos possíveis
          (this.eventoService as any).listarEventosProximos(lat, lon, 1000).subscribe({
            next: async (eventos: any) => {
              let todosEventos: EventoResponseDTO[] = [];

              if (eventos instanceof Blob) {
                const blobText = await eventos.text();
                todosEventos = JSON.parse(blobText);
              } else {
                todosEventos = eventos;
              }

              console.log('🌍 Total de eventos próximos encontrados:', todosEventos.length);

              // Verificar inscrições em TODOS os eventos (incluindo os do usuário)
              this.loadInscricoes(todosEventos, eventosFinalizadosUsuario);
            },
            error: (err: any) => {
              console.error('❌ Erro ao carregar eventos próximos:', err);
              // Se falhar, tentar apenas com os eventos do usuário
              this.loadInscricoes(this.eventosUsuario(), eventosFinalizadosUsuario);
            }
          });
        },
        (error) => {
          console.error('❌ Erro ao obter localização:', error);
          // Se falhar a geolocalização, usar apenas eventos do usuário
          this.loadInscricoes(this.eventosUsuario(), eventosFinalizadosUsuario);
        }
      );
    } else {
      // Se não tiver geolocalização, usar apenas eventos do usuário
      this.loadInscricoes(this.eventosUsuario(), eventosFinalizadosUsuario);
    }
  }

  loadInscricoes(eventosArray: EventoResponseDTO[], eventosFinalizadosUsuario: EventoResponseDTO[]): void {
    // Primeiro, buscar o perfil do usuário para obter o ID
    this.authService.getProfile().subscribe({
      next: (profile) => {
        const usuarioId = profile.id;
        console.log('🔍 ID do usuário logado:', usuarioId);
        console.log('📋 Total de eventos para verificar:', eventosArray.length);

        // Buscar eventos em que o usuário está inscrito
        const inscricoesPromises = eventosArray.map(evento => {
          if (evento.id) {
            return this.inscricaoService.listarInscricoes(evento.id).toPromise()
              .then((inscricoes: any) => {
                console.log(`📝 Evento "${evento.nome}" (ID: ${evento.id}) - Inscrições:`, inscricoes);
                
                // Verificar se o usuário está inscrito neste evento usando o ID
                const usuarioInscrito = inscricoes?.some((insc: any) => {
                  console.log(`  Comparando IDs: ${insc.jogadorId} === ${usuarioId}`, insc.jogadorId === usuarioId);
                  return insc.jogadorId === usuarioId;
                });
                
                console.log(`  ✅ Usuário inscrito em "${evento.nome}":`, usuarioInscrito);
                
                if (usuarioInscrito) {
                  return evento;
                }
                return null;
              })
              .catch((error) => {
                console.error(`❌ Erro ao buscar inscrições do evento ${evento.id}:`, error);
                return null;
              });
          }
          return Promise.resolve(null);
        });

        this.processarInscricoes(inscricoesPromises, eventosFinalizadosUsuario);
      },
      error: (error) => {
        console.error('❌ Erro ao buscar perfil do usuário:', error);
        // Se falhar ao buscar o perfil, não conseguimos verificar as inscrições
        this.eventosFinalizados.set(this.sortEventsByDate(eventosFinalizadosUsuario));
        this.eventosFinalizadosFiltrados.set(this.sortEventsByDate(eventosFinalizadosUsuario));
      }
    });
  }

  private processarInscricoes(inscricoesPromises: Promise<EventoResponseDTO | null>[], eventosFinalizadosUsuario: EventoResponseDTO[]): void {

    Promise.all(inscricoesPromises).then(resultados => {
      console.log('📊 Resultados das promessas:', resultados);
      
      const eventosInscritosNaoNulos = resultados.filter((e): e is EventoResponseDTO => e !== null);
      console.log('✅ Eventos em que o usuário está inscrito:', eventosInscritosNaoNulos);

      const now = dayjs();
      const eventosInscritosAtivos = eventosInscritosNaoNulos.filter(e => {
        const dataEvento = dayjs(e.dataHorario);
        const isAtivo = dataEvento.isAfter(now) || dataEvento.isSame(now, 'day');
        console.log(`  📅 Evento "${e.nome}" - Data: ${e.dataHorario}, É ativo?: ${isAtivo}`);
        return isAtivo;
      });

      const eventosInscritosFinalizados = eventosInscritosNaoNulos.filter(e => {
        const dataEvento = dayjs(e.dataHorario);
        const isFinalizado = dataEvento.isBefore(now);
        console.log(`  📅 Evento "${e.nome}" - Data: ${e.dataHorario}, É finalizado?: ${isFinalizado}`);
        return isFinalizado;
      });

      console.log('🟢 Eventos inscritos ATIVOS:', eventosInscritosAtivos);
      console.log('🔴 Eventos inscritos FINALIZADOS:', eventosInscritosFinalizados);

      this.eventosInscritos.set(this.sortEventsByDate(eventosInscritosAtivos));
      this.eventosInscritosFiltrados.set(this.sortEventsByDate(eventosInscritosAtivos));

      // Combinar eventos finalizados organizados pelo usuário com eventos finalizados em que participou
      const todosEventosFinalizados = [
        ...eventosFinalizadosUsuario,
        ...eventosInscritosFinalizados
      ];

      // Remover duplicatas baseado no ID
      const eventosFinalizadosUnicos = todosEventosFinalizados.filter((evento, index, self) =>
        index === self.findIndex((e) => e.id === evento.id)
      );

      this.eventosFinalizados.set(this.sortEventsByDate(eventosFinalizadosUnicos));
      this.eventosFinalizadosFiltrados.set(this.sortEventsByDate(eventosFinalizadosUnicos));
    });
  }

  // --- AÇÕES DO USUÁRIO ---

  // 1. EXCLUIR EVENTO (Corrigido com Dialog)
  onDeleteEvent(evento: EventoResponseDTO, event: MouseEvent): void {
    // Impede que o clique no botão abra os detalhes do evento (card click)
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.langService.translate('delete.event') || 'Excluir Evento',
        message: this.langService.translate('delete.event.confirm') || 'Tem certeza que deseja excluir este evento?'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && evento.id) {
        this.isLoading.set(true);

        // Chamada ao serviço de exclusão com casting para evitar erro de TS se o método não estiver na interface
        (this.eventoService as any).deletarEvento(evento.id)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              // Remove localmente da lista para atualizar a UI sem recarregar tudo
              const novaLista = this.eventosUsuario().filter(e => e.id !== evento.id);
              this.eventosUsuario.set(novaLista);
              this.filterEvents(); // Atualiza os filtros

              this.snackBar.open(
                this.langService.translate('event.deleted.success') || 'Evento excluído!',
                'OK', { duration: 3000 }
              );
            },
            error: (error: any) => {
              console.error('Erro ao deletar:', error);
              this.snackBar.open(
                this.langService.translate('event.deleted.error') || 'Erro ao excluir.',
                'OK', { duration: 3000 }
              );
            }
          });
      }
    });
  }

  // 2. EDITAR EVENTO
  onEditEvent(evento: EventoResponseDTO, event: MouseEvent): void {
    event.stopPropagation();
    if (evento.id) {
      this.router.navigate(['/event-details', evento.id], {
        queryParams: { edit: 'true' }
      });
    }
  }

  // 3. PARTICIPAR
  onRequestJoin(evento: EventoResponseDTO, event: MouseEvent): void {
    event.stopPropagation();
    // Lógica futura para participar
    console.log('Solicitar participação em:', evento.nome);
  }

  // 4. CRIAR EVENTO
  onCreateEvent(): void {
    this.router.navigate(['/create-event']);
  }

  // 5. VER DETALHES
  onViewEvent(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/event-details', id]);
    }
  }

  // --- FILTROS E BUSCA ---

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.filterEvents();
  }

  filterEvents(): void {
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) {
      this.eventosUsuarioFiltrados.set(this.eventosUsuario());
      this.eventosProximosFiltrados.set(this.eventosProximos());
      this.eventosInscritosFiltrados.set(this.eventosInscritos());
      this.eventosFinalizadosFiltrados.set(this.eventosFinalizados());
      return;
    }

    const match = (e: EventoResponseDTO) => this.matchesSearch(e, term);

    this.eventosUsuarioFiltrados.set(this.sortEventsByDate(this.eventosUsuario().filter(match)));
    this.eventosProximosFiltrados.set(this.sortEventsByDate(this.eventosProximos().filter(match)));
    this.eventosInscritosFiltrados.set(this.sortEventsByDate(this.eventosInscritos().filter(match)));
    this.eventosFinalizadosFiltrados.set(this.sortEventsByDate(this.eventosFinalizados().filter(match)));
  }

  private matchesSearch(evento: EventoResponseDTO, term: string): boolean {
    return (
      (evento.nome?.toLowerCase() || '').includes(term) ||
      (evento.local?.toLowerCase() || '').includes(term) ||
      (evento.usuarioNome?.toLowerCase() || '').includes(term) ||
      this.formatDate(evento.dataHorario).toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.filterEvents();
  }

  // --- UTILITÁRIOS ---

  private sortEventsByDate(eventos: EventoResponseDTO[]): EventoResponseDTO[] {
    return [...eventos].sort((a, b) => {
      const dateA = dayjs(a.dataHorario);
      const dateB = dayjs(b.dataHorario);
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return dayjs.utc(dateString).tz(userZone).format("DD/MM/YYYY HH:mm");
  }
}
