import { Component, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OngoingEventsComponent } from '../ongoing-events/ongoing-events.component';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    OngoingEventsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(public languageService: LanguageService) {}

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  onCreateEvent() {
    console.log('Navigate to create event');
  }

  onJoinEvent() {
    console.log('Navigate to join event');
  }
}
