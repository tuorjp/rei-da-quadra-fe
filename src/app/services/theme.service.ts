import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = 'rei-da-quadra-theme';

    themeMode = signal<ThemeMode>('system');

    constructor() {
        this.loadTheme();
        this.applyTheme();
    }

    setTheme(mode: ThemeMode) {
        this.themeMode.set(mode);
        localStorage.setItem(this.THEME_KEY, mode);
        this.applyTheme();
    }

    private loadTheme() {
        const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeMode;
        if (savedTheme) {
            this.themeMode.set(savedTheme);
        }
    }

    private applyTheme() {
        const mode = this.themeMode();
        const body = document.body;

        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme');

        if (mode === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
        } else {
            body.classList.add(`${mode}-theme`);
        }
    }
}