import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { OngoingEventsComponent } from './components/ongoing-events/ongoing-events.component';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatCardModule,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    OngoingEventsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = computed(() => this.languageService.translate('app.title'));
  
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
