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
    'events.title': {
      pt: 'Eventos de Futebol',
      en: 'Football Events',
      es: 'Eventos de Fútbol'
    },
    'create.event': {
      pt: 'Criar Evento',
      en: 'Create Event',
      es: 'Crear Evento'
    },
    'create.event.description': {
      pt: 'Crie seu primeiro evento de futebol para começar',
      en: 'Create your first football event to get started',
      es: 'Crea tu primer evento de fútbol para comenzar'
    },
    'join.event': {
      pt: 'Entrar em Evento',
      en: 'Join Event',
      es: 'Unirse a Evento'
    },
    'join.event.description': {
      pt: 'Participe de eventos criados por outros organizadores',
      en: 'Join events created by other organizers',
      es: 'Únete a eventos creados por otros organizadores'
    },
    'new.event': {
      pt: 'Novo Evento',
      en: 'New Event',
      es: 'Nuevo Evento'
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
    },
    'events.ongoing': {
      pt: 'Eventos em Andamento',
      en: 'Ongoing Events',
      es: 'Eventos en Curso'
    },
    'events.participant': {
      pt: 'Participante',
      en: 'Participant',
      es: 'Participante'
    },
    'events.organizer': {
      pt: 'Organizador',
      en: 'Organizer',
      es: 'Organizador'
    },
    'profile': {
      pt: 'Perfil',
      en: 'Profile',
      es: 'Perfil'
    },
    'skill.points': {
      pt: 'Pontos de Habilidade',
      en: 'Skill Points',
      es: 'Puntos de Habilidad'
    },
    'footer.rights': {
      pt: 'Todos os direitos reservados.',
      en: 'All rights reserved.',
      es: 'Todos los derechos reservados.'
    },
    'events.details': {
      pt: 'Detalhes',
      en: 'Details',
      es: 'Detalles'
    },
    'events.manage': {
      pt: 'Gerenciar',
      en: 'Manage',
      es: 'Administrar'
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
