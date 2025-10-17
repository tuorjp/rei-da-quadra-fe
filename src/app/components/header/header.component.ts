import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Importar o Router
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip'; // Importar o MatTooltipModule
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { LanguageService, Language } from '../../services/language.service';
import { AuthService } from '../../services/auth.service'; // Importar o AuthService

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule // Adicionar MatTooltipModule aqui
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  userSkillPoints = 1250;
  userAvatar = 'assets/default-avatar.svg';

  constructor(
    public themeService: ThemeService,
    public languageService: LanguageService,
    private authService: AuthService, // Injetar AuthService
    private router: Router // Injetar Router
  ) { }

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
    console.log('Navigate to profile');
  }

  logout(): void {
    this.authService.logout(); // Chama o metodog de logout do seu serviço (que deve limpar o token, etc.)
    this.router.navigate(['/login']); // Redireciona o usuário para a página de login
  }
}
