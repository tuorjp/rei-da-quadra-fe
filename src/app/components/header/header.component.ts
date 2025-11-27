import {Component, effect} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LanguageService, Language } from '../../services/language.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  userAvatar: any;

  constructor(
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {

    // Inicializa com a foto existente
    this.userAvatar = this.authService.userPhoto();

    // Atualiza automaticamente quando o usuário alterar a foto
    effect(() => {
      this.userAvatar = this.authService.userPhoto();
    });
  }


  setLanguage(language: Language) {
    this.languageService.setLanguage(language);
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  onProfileClick() {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
