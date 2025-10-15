import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  private router = inject(Router);
  public languageService = inject(LanguageService);

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  onCreateEvent() {
    this.router.navigate(['/create-event']);
  }

  onJoinEvent() {
    this.router.navigate(['/my-events']);
  }
}
