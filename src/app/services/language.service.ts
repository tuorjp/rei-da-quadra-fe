import { Injectable, signal } from '@angular/core';

export type Language = 'pt' | 'en' | 'es';

export interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANGUAGE_KEY = 'rei-da-quadra-language';
  
  currentLanguage = signal<Language>('pt');
  
  private translations: Translations = {
    'app.title': {
      pt: 'Rei da Quadra',
      en: 'Court King',
      es: 'Rey de la Cancha'
    },
    'competitions.title': {
      pt: 'Competições de Futebol',
      en: 'Football Competitions',
      es: 'Competiciones de Fútbol'
    },
    'create.competition': {
      pt: 'Criar Competição',
      en: 'Create Competition',
      es: 'Crear Competición'
    },
    'create.competition.description': {
      pt: 'Crie sua primeira competição de futebol para começar',
      en: 'Create your first football competition to get started',
      es: 'Crea tu primera competición de fútbol para comenzar'
    },
    'player.rotation': {
      pt: 'Rodízio de Jogadores',
      en: 'Player Rotation',
      es: 'Rotación de Jugadores'
    },
    'player.rotation.description': {
      pt: 'Gerencie times com rodízio automático de jogadores',
      en: 'Manage teams with automatic player rotation',
      es: 'Gestiona equipos con rotación automática de jugadores'
    },
    'new.competition': {
      pt: 'Nova Competição',
      en: 'New Competition',
      es: 'Nueva Competición'
    },
    'online': {
      pt: 'Online',
      en: 'Online',
      es: 'En línea'
    },
    'language': {
      pt: 'Idioma',
      en: 'Language',
      es: 'Idioma'
    },
    'theme': {
      pt: 'Tema',
      en: 'Theme',
      es: 'Tema'
    },
    'theme.light': {
      pt: 'Claro',
      en: 'Light',
      es: 'Claro'
    },
    'theme.dark': {
      pt: 'Escuro',
      en: 'Dark',
      es: 'Oscuro'
    },
    'theme.system': {
      pt: 'Sistema',
      en: 'System',
      es: 'Sistema'
    }
  };

  constructor() {
    this.loadLanguage();
  }

  setLanguage(language: Language) {
    this.currentLanguage.set(language);
    localStorage.setItem(this.LANGUAGE_KEY, language);
  }

  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      return key;
    }
    return translation[this.currentLanguage()] || key;
  }

  private loadLanguage() {
    const savedLanguage = localStorage.getItem(this.LANGUAGE_KEY) as Language;
    if (savedLanguage) {
      this.currentLanguage.set(savedLanguage);
    }
  }
}