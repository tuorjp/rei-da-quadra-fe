import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { LanguageService, Language } from '../../services/language.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatBadgeModule
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent {
    // Mock user data - replace with actual user service
    userSkillPoints = 1250;
    userAvatar = 'assets/default-avatar.svg';

    constructor(
        public themeService: ThemeService,
        public languageService: LanguageService
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
        // Navigate to profile page
        console.log('Navigate to profile');
    }
}