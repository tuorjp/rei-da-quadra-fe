import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { EventoControllerService } from '../../api/api/eventoController.service';
import { EventoResponseDTO } from '../../api/model/eventoResponseDTO';
import { LanguageService } from '../../services/language.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css'
})
export class MyEventsComponent implements OnInit {
  private eventoService = inject(EventoControllerService);
  private router = inject(Router);
  public langService = inject(LanguageService);

  eventos = signal<EventoResponseDTO[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string>('');

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.eventoService.listarEventos()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: async (eventos) => {
          console.log(eventos)
          
          if(eventos instanceof Blob) {
            const blobText = await eventos.text()
            const eventosJson = JSON.parse(blobText)

            this.eventos.set(eventosJson)
            return
          }
          
          this.eventos.set(eventos);
        },
        error: (error) => {
          console.error('Erro ao carregar eventos:', error);
          this.error.set('Erro ao carregar eventos');
        }
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(this.langService.currentLanguage());
  }
}

