import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ThemeService, ThemeMode } from './services/theme.service';
import { LanguageService, Language } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = computed(() => this.languageService.translate('app.title'));
  
  constructor(
    public themeService: ThemeService,
    public languageService: LanguageService
  ) {}

  setTheme(mode: ThemeMode) {
    this.themeService.setTheme(mode);
  }

  setLanguage(language: Language) {
    this.languageService.setLanguage(language);
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
