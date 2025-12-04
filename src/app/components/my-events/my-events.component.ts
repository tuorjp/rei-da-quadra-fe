import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { EventoControllerService } from '../../api/api/eventoController.service';
import { EventoResponseDTO } from '../../api/model/eventoResponseDTO';
import { LanguageService } from '../../services/language.service';
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
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css'
})
export class MyEventsComponent implements OnInit {
  private eventoService = inject(EventoControllerService);
  private router = inject(Router);
  public langService = inject(LanguageService);

  // Eventos separados por categoria (originais)
  eventosUsuario = signal<EventoResponseDTO[]>([]);
  eventosProximos = signal<EventoResponseDTO[]>([]);
  eventosInscritos = signal<EventoResponseDTO[]>([]);
  eventosFinalizados = signal<EventoResponseDTO[]>([]);

  // Eventos filtrados (para exibição)
  eventosUsuarioFiltrados = signal<EventoResponseDTO[]>([]);
  eventosProximosFiltrados = signal<EventoResponseDTO[]>([]);
  eventosInscritosFiltrados = signal<EventoResponseDTO[]>([]);
  eventosFinalizadosFiltrados = signal<EventoResponseDTO[]>([]);

  isLoading = signal<boolean>(true);
  error = signal<string>('');
  selectedTabIndex = signal<number>(0);
  searchTerm = signal<string>('');

  ngOnInit(): void {
    this.loadAllEvents();
  }

  loadAllEvents(): void {
    this.isLoading.set(true);
    this.error.set('');

    // Primeiro, carrega os eventos do usuário
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

          // Separar eventos ativos e finalizados do usuário
          const now = dayjs();
          const eventosAtivos = this.sortEventsByDate(
            eventosArray.filter(e => 
              e.status === 'ATIVO' || !e.status || dayjs(e.dataHorario).isAfter(now)
            )
          );
          const eventosFinalizadosUsuario = this.sortEventsByDate(
            eventosArray.filter(e => 
              e.status !== 'ATIVO' && e.status && dayjs(e.dataHorario).isBefore(now)
            )
          );

          this.eventosUsuario.set(eventosAtivos);
          this.eventosUsuarioFiltrados.set(eventosAtivos);
          
          // Carregar eventos próximos e inscritos
          this.loadNearbyEvents();
          this.loadInscricoes(eventosArray, eventosFinalizadosUsuario);
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
            next: (eventos: EventoResponseDTO[]) => {
              // Filtrar apenas eventos que não foram criados pelo usuário
              const eventosOutrosUsuarios = this.sortEventsByDate(
                eventos.filter(e => {
                  const isUsuarioEvento = this.eventosUsuario().some(eu => eu.id === e.id);
                  return !isUsuarioEvento;
                })
              );
              
              this.eventosProximos.set(eventosOutrosUsuarios);
              this.eventosProximosFiltrados.set(eventosOutrosUsuarios);
            },
            error: (err: any) => {
              console.error('Erro ao carregar eventos próximos', err);
            }
          });
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
        }
      );
    }
  }

  loadInscricoes(_eventosUsuario: EventoResponseDTO[], eventosFinalizadosUsuario: EventoResponseDTO[]): void {
    // Por enquanto, vamos apenas definir os eventos finalizados
    // A lógica de inscrições será implementada quando houver uma API específica
    // para listar todos os eventos onde o usuário está inscrito
    
    this.eventosFinalizados.set(eventosFinalizadosUsuario);
    this.eventosFinalizadosFiltrados.set(eventosFinalizadosUsuario);
    
    // TODO: Implementar quando houver endpoint para listar eventos inscritos pelo usuário
    // Por enquanto, a aba de inscrições ficará vazia até que seja implementada
    // uma API que retorne todos os eventos onde o usuário está inscrito
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.filterEvents();
  }

  filterEvents(): void {
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) {
      // Se não há termo de busca, mostra todos os eventos (já ordenados)
      this.eventosUsuarioFiltrados.set(this.eventosUsuario());
      this.eventosProximosFiltrados.set(this.eventosProximos());
      this.eventosInscritosFiltrados.set(this.eventosInscritos());
      this.eventosFinalizadosFiltrados.set(this.eventosFinalizados());
      return;
    }

    // Filtra eventos por nome, local, organizador ou status (mantém ordenação)
    this.eventosUsuarioFiltrados.set(
      this.sortEventsByDate(this.eventosUsuario().filter(e => this.matchesSearch(e, term)))
    );

    this.eventosProximosFiltrados.set(
      this.sortEventsByDate(this.eventosProximos().filter(e => this.matchesSearch(e, term)))
    );

    this.eventosInscritosFiltrados.set(
      this.sortEventsByDate(this.eventosInscritos().filter(e => this.matchesSearch(e, term)))
    );

    this.eventosFinalizadosFiltrados.set(
      this.sortEventsByDate(this.eventosFinalizados().filter(e => this.matchesSearch(e, term)))
    );
  }

  private matchesSearch(evento: EventoResponseDTO, term: string): boolean {
    return (
      evento.nome?.toLowerCase().includes(term) ||
      evento.local?.toLowerCase().includes(term) ||
      evento.usuarioNome?.toLowerCase().includes(term) ||
      evento.status?.toLowerCase().includes(term) ||
      this.formatDate(evento.dataHorario).toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.filterEvents();
  }

  private sortEventsByDate(eventos: EventoResponseDTO[]): EventoResponseDTO[] {
    return [...eventos].sort((a, b) => {
      const dateA = dayjs(a.dataHorario);
      const dateB = dayjs(b.dataHorario);
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
    });
  }

  onCreateEvent(): void {
    this.router.navigate(['/create-event']);
  }

  onViewEvent(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/event-details', id]);
    }
  }

  onEditEvent(evento: any): void { // Pode receber o objeto evento ou o ID
    const id = evento.id || evento; // Garante que temos o ID

    if (id) {
      this.router.navigate(['/event-details', id], {
        queryParams: { edit: 'true' } // <--- ADICIONE ISSO
      });
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return dayjs.utc(dateString).tz(userZone).format("DD/MM/YYYY HH:mm");
  }
}

