import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { LanguageService, Language } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userSkillPoints = 1250;
  // Simula um usuário sem foto. Se tivesse, seria algo como: 'assets/minha-foto.jpg'
  userAvatar: string | null = null;

  constructor(
    public themeService: ThemeService,
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) { }

  // ... (resto dos seus métodos)
  setTheme(mode: ThemeMode) {
    this.themeService.setTheme(mode);
  }

  setLanguage(language: Language) {
    this.languageService.setLanguage(language);
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  onProfileClick() {
    // Navigate to profile page
    console.log('Navigate to profile');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
