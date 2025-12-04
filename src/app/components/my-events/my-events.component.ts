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
import { EventoResponseDTO } from '../../api/model/eventoResponseDTO';
import { LanguageService } from '../../services/language.service';
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
              const eventosOutrosUsuarios = this.sortEventsByDate(
                eventos.filter(e => {
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

  loadInscricoes(_eventosUsuario: EventoResponseDTO[], eventosFinalizadosUsuario: EventoResponseDTO[]): void {
    this.eventosFinalizados.set(eventosFinalizadosUsuario);
    this.eventosFinalizadosFiltrados.set(eventosFinalizadosUsuario);
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
