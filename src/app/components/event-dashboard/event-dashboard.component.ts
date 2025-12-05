import { Component, computed, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { PartidaResponseDTO, PartidasService } from '../../api';

@Component({
  selector: 'app-event-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './event-dashboard.component.html',
  styleUrl: './event-dashboard.component.css'
})
export class EventDashboardComponent implements OnInit, OnChanges {
  @Input() eventoId!: number | undefined;

  private partidaService = inject(PartidasService);

  partidasNaoIniciadas = signal<PartidaResponseDTO[]>([]);
  partidasFinalizadas = signal<PartidaResponseDTO[]>([]);
  isLoading = signal<boolean>(true);

  displayedColumnsNaoIniciadas: string[] = ['data', 'timeA', 'timeB', 'status'];
  displayedColumnsFinalizadas: string[] = ['data', 'timeA', 'timeB', 'placar', 'vencedor'];

  ngOnInit() {
    this.carregarPartidas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventoId'] && this.eventoId) {
      this.carregarPartidas();
    }
  }

  carregarPartidas() {
    if (!this.eventoId) return;

    this.isLoading.set(true);
    this.partidaService.listarPorEvento(this.eventoId).subscribe({
      next: (partidas) => {
        const naoIniciadas = partidas.filter(p => p.status === 'AGUARDANDO_INICIO');
        const finalizadas = partidas.filter(p => p.status === 'JOGADA');

        this.partidasNaoIniciadas.set(naoIniciadas);
        this.partidasFinalizadas.set(finalizadas);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar partidas:', err);
        this.isLoading.set(false);
      }
    });
  }

  getVencedor(partida: PartidaResponseDTO): string {
    if (!partida.timeAPlacar && !partida.timeBPlacar) return '-';
    
    const placarA = partida.timeAPlacar || 0;
    const placarB = partida.timeBPlacar || 0;

    if (placarA > placarB) return partida.timeANome || 'Time A';
    if (placarB > placarA) return partida.timeBNome || 'Time B';
    return 'Empate';
  }
}
