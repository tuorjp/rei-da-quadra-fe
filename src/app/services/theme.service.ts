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
        this.watchSystemTheme();
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
        const html = document.documentElement;

        // Remove existing theme classes from both body and html
        body.classList.remove('light-theme', 'dark-theme');
        html.classList.remove('light-theme', 'dark-theme');

        if (mode === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const themeClass = prefersDark ? 'dark-theme' : 'light-theme';
            body.classList.add(themeClass);
            html.classList.add(themeClass);
        } else {
            const themeClass = `${mode}-theme`;
            body.classList.add(themeClass);
            html.classList.add(themeClass);
        }
    }

    private watchSystemTheme() {
        // Watch for system theme changes
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        darkModeQuery.addEventListener('change', (e) => {
            // Only react if we're in system mode
            if (this.themeMode() === 'system') {
                this.applyTheme();
            }
        });
    }
}
