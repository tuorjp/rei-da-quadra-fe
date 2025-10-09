import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { LanguageService } from '../../services/language.service';

export interface Event {
  id: string;
  name: string;
  location: string;
  date: Date;
  isOrganizer: boolean;
  participantCount: number;
  maxParticipants: number;
  status: 'ongoing' | 'upcoming' | 'finished';
}

@Component({
  selector: 'app-ongoing-events',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule
  ],
  templateUrl: './ongoing-events.component.html',
  styleUrl: './ongoing-events.component.css'
})
export class OngoingEventsComponent {
  // Mock data - replace with actual service
  events: Event[] = [
    {
      id: '1',
      name: 'Torneio de Verão 2024',
      location: 'Quadra Central',
      date: new Date('2024-12-15T14:00:00'),
      isOrganizer: true,
      participantCount: 12,
      maxParticipants: 16,
      status: 'ongoing'
    },
    {
      id: '2',
      name: 'Liga dos Amigos',
      location: 'Campo do Bairro',
      date: new Date('2024-12-16T16:00:00'),
      isOrganizer: false,
      participantCount: 8,
      maxParticipants: 12,
      status: 'upcoming'
    },
    {
      id: '3',
      name: 'Copa Relâmpago',
      location: 'Arena Sports',
      date: new Date('2024-12-14T10:00:00'),
      isOrganizer: true,
      participantCount: 16,
      maxParticipants: 16,
      status: 'ongoing'
    }
  ];

  constructor(public languageService: LanguageService) {}

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  onEventClick(event: Event) {
    console.log('Navigate to event:', event.id);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ongoing': return 'primary';
      case 'upcoming': return 'accent';
      case 'finished': return 'warn';
      default: return 'primary';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString(this.languageService.currentLanguage(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}