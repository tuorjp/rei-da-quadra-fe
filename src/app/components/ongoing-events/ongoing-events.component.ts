import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LanguageService } from '../../services/language.service';
import { EventoControllerService } from '../../api/api/eventoController.service';
import { EventoResponseDTO } from '../../api/model/eventoResponseDTO';

@Component({
  selector: 'app-ongoing-events',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ongoing-events.component.html',
  styleUrl: './ongoing-events.component.css'
})
export class OngoingEventsComponent implements OnInit {
  private router = inject(Router);
  private eventoService = inject(EventoControllerService);
  private snackBar = inject(MatSnackBar);
  public languageService = inject(LanguageService);

  events: EventoResponseDTO[] = [];
  isLoading = true;

  ngOnInit() {
    this.getUserLocation();
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.loadNearbyEvents(lat, lon);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
      console.error('Geolocalização não suportada');
    }
  }

  loadNearbyEvents(lat: number, lon: number) {
    (this.eventoService as any).listarEventosProximos(lat, lon).subscribe({
      next: (data: EventoResponseDTO[]) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar eventos próximos', err);
        this.isLoading = false;
      }
    });
  }

  onEventClick(event: EventoResponseDTO) {
    if (event.id) {
      this.router.navigate(['/event-details', event.id]);
    }
  }

  onRequestJoin(event: EventoResponseDTO, evt: MouseEvent) {
    evt.stopPropagation();
    this.snackBar.open(this.translate('request.sent'), 'OK', { duration: 3000 });
  }

  onEditEvent(event: EventoResponseDTO, evt: MouseEvent) {
    evt.stopPropagation();
    this.router.navigate(['/event-details', event.id]);
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  getStatusColor(status: string): string {
    return status === 'ATIVO' ? 'primary' : 'warn';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);

    // Formato: dd/MM/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    // Formato: HH:mm
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year}, às ${hours}:${minutes}`;
  }
}
