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
    },
    'my.events': {
      pt: 'Meus Eventos',
      en: 'My Events',
      es: 'Mis Eventos'
    },
    'event.name': {
      pt: 'Nome do Evento',
      en: 'Event Name',
      es: 'Nombre del Evento'
    },
    'event.name.placeholder': {
      pt: 'Ex: Racha de Sexta-feira',
      en: 'Ex: Friday Match',
      es: 'Ej: Partido del Viernes'
    },
    'event.location': {
      pt: 'Local',
      en: 'Location',
      es: 'Ubicación'
    },
    'event.location.placeholder': {
      pt: 'Ex: Quadra do Parque Central',
      en: 'Ex: Central Park Court',
      es: 'Ej: Cancha del Parque Central'
    },
    'event.datetime': {
      pt: 'Data e Hora',
      en: 'Date and Time',
      es: 'Fecha y Hora'
    },
    'event.organizer': {
      pt: 'Organizador',
      en: 'Organizer',
      es: 'Organizador'
    },
    'field.required': {
      pt: 'Campo obrigatório',
      en: 'Required field',
      es: 'Campo obligatorio'
    },
    'field.minlength': {
      pt: 'Mínimo de 3 caracteres',
      en: 'Minimum 3 characters',
      es: 'Mínimo 3 caracteres'
    },
    'button.cancel': {
      pt: 'Cancelar',
      en: 'Cancel',
      es: 'Cancelar'
    },
    'button.create': {
      pt: 'Criar Evento',
      en: 'Create Event',
      es: 'Crear Evento'
    },
    'button.creating': {
      pt: 'Criando...',
      en: 'Creating...',
      es: 'Creando...'
    },
    'button.save': {
      pt: 'Salvar',
      en: 'Save',
      es: 'Guardar'
    },
    'button.saving': {
      pt: 'Salvando...',
      en: 'Saving...',
      es: 'Guardando...'
    },
    'button.edit': {
      pt: 'Editar',
      en: 'Edit',
      es: 'Editar'
    },
    'button.delete': {
      pt: 'Deletar',
      en: 'Delete',
      es: 'Eliminar'
    },
    'button.back': {
      pt: 'Voltar',
      en: 'Back',
      es: 'Volver'
    },
    'button.confirm': {
      pt: 'Confirmar',
      en: 'Confirm',
      es: 'Confirmar'
    },
    'event.created.success': {
      pt: 'Evento criado com sucesso!',
      en: 'Event created successfully!',
      es: '¡Evento creado con éxito!'
    },
    'event.created.error': {
      pt: 'Erro ao criar evento. Tente novamente.',
      en: 'Error creating event. Please try again.',
      es: 'Error al crear evento. Inténtalo de nuevo.'
    },
    'event.updated.success': {
      pt: 'Evento atualizado com sucesso!',
      en: 'Event updated successfully!',
      es: '¡Evento actualizado con éxito!'
    },
    'event.updated.error': {
      pt: 'Erro ao atualizar evento. Tente novamente.',
      en: 'Error updating event. Please try again.',
      es: 'Error al actualizar evento. Inténtalo de nuevo.'
    },
    'event.deleted.success': {
      pt: 'Evento deletado com sucesso!',
      en: 'Event deleted successfully!',
      es: '¡Evento eliminado con éxito!'
    },
    'event.deleted.error': {
      pt: 'Erro ao deletar evento. Tente novamente.',
      en: 'Error deleting event. Please try again.',
      es: 'Error al eliminar evento. Inténtalo de nuevo.'
    },
    'event.load.error': {
      pt: 'Erro ao carregar evento.',
      en: 'Error loading event.',
      es: 'Error al cargar evento.'
    },
    'loading': {
      pt: 'Carregando...',
      en: 'Loading...',
      es: 'Cargando...'
    },
    'retry': {
      pt: 'Tentar novamente',
      en: 'Retry',
      es: 'Reintentar'
    },
    'no.events': {
      pt: 'Nenhum evento encontrado',
      en: 'No events found',
      es: 'No se encontraron eventos'
    },
    'no.events.description': {
      pt: 'Você ainda não criou nenhum evento. Crie seu primeiro evento agora!',
      en: "You haven't created any events yet. Create your first event now!",
      es: 'Aún no has creado ningún evento. ¡Crea tu primer evento ahora!'
    },
    'create.first.event': {
      pt: 'Criar Primeiro Evento',
      en: 'Create First Event',
      es: 'Crear Primer Evento'
    },
    'view.details': {
      pt: 'Ver Detalhes',
      en: 'View Details',
      es: 'Ver Detalles'
    },
    'edit.event': {
      pt: 'Editar Evento',
      en: 'Edit Event',
      es: 'Editar Evento'
    },
    'delete.event': {
      pt: 'Deletar Evento',
      en: 'Delete Event',
      es: 'Eliminar Evento'
    },
    'delete.event.confirm': {
      pt: 'Tem certeza que deseja deletar este evento? Esta ação não pode ser desfeita.',
      en: 'Are you sure you want to delete this event? This action cannot be undone.',
      es: '¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.'
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
