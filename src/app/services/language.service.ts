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
    'welcome.text': {
      pt: 'Bem-vindo ao',
      en: 'Welcome to',
      es: 'Bienvenido a'
    },
    'app.name': {
      pt: 'Rei da Quadra Club',
      en: 'Rei da Quadra Club',
      es: 'Rei da Quadra Club'
    },
    'app.subtitle': {
      pt: 'Gerenciador de partidas',
      en: 'Match Manager',
      es: 'Administrador de Partidos'
    },
    'events.title': {
      pt: 'Eventos de Futebol',
      en: 'Football Events',
      es: 'Eventos de Fútbol'
    },
    // --- NOVAS CHAVES ADICIONADAS ---
    'events': {
      pt: 'Eventos',
      en: 'Events',
      es: 'Eventos'
    },
    'events.description': {
      pt: 'Visualize e gerencie todos os eventos',
      en: 'View and manage all events',
      es: 'Ver y administrar todos los eventos'
    },
    // --------------------------------
    'create.event': {
      pt: 'Criar Evento',
      en: 'Create Event',
      es: 'Crear Evento'
    },
    'create.event.description': {
      pt: 'Crie seu primeiro evento para começar',
      en: 'Create your first event to get started',
      es: 'Crea tu primer evento para comenzar'
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
      pt: 'Eventos Próximos',
      en: 'Upcoming Events',
      es: 'Próximos eventos'
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
    'my.events.description': {
      pt: 'Visualize e gerencie seus eventos criados',
      en: 'View and manage your created events',
      es: 'Ver y administrar tus eventos creados'
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
    'edit': {
      pt: 'Editar',
      en: 'Edit',
      es: 'Editar'
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
    },
    'inscriptions': {
      pt: 'Inscrições',
      en: 'Inscriptions',
      es: 'Inscripciones'
    },
    'inscriptions.manage': {
      pt: 'Gerenciar Inscrições',
      en: 'Manage Inscriptions',
      es: 'Administrar Inscripciones'
    },
    'inscriptions.add': {
      pt: 'Adicionar Jogador',
      en: 'Add Player',
      es: 'Agregar Jugador'
    },
    'inscriptions.list': {
      pt: 'Lista de Inscritos',
      en: 'Registered Players',
      es: 'Lista de Inscritos'
    },
    'inscriptions.none': {
      pt: 'Nenhum jogador inscrito ainda',
      en: 'No players registered yet',
      es: 'Ningún jugador inscrito aún'
    },
    'inscriptions.total': {
      pt: 'Total de Inscritos',
      en: 'Total Registered',
      es: 'Total de Inscritos'
    },
    'player.name': {
      pt: 'Nome do Jogador',
      en: 'Player Name',
      es: 'Nombre del Jugador'
    },
    'player.email': {
      pt: 'Email',
      en: 'Email',
      es: 'Correo'
    },
    'player.remove': {
      pt: 'Remover Jogador',
      en: 'Remove Player',
      es: 'Eliminar Jugador'
    },
    'player.remove.confirm': {
      pt: 'Tem certeza que deseja remover este jogador?',
      en: 'Are you sure you want to remove this player?',
      es: '¿Estás seguro de que deseas eliminar este jugador?'
    },
    'teams': {
      pt: 'Times',
      en: 'Teams',
      es: 'Equipos'
    },
    'teams.manage': {
      pt: 'Gerenciar Times',
      en: 'Manage Teams',
      es: 'Administrar Equipos'
    },
    'teams.create': {
      pt: 'Criar Time',
      en: 'Create Team',
      es: 'Crear Equipo'
    },
    'teams.none': {
      pt: 'Nenhum time criado ainda',
      en: 'No teams created yet',
      es: 'Ningún equipo creado aún'
    },
    'team.name': {
      pt: 'Nome do Time',
      en: 'Team Name',
      es: 'Nombre del Equipo'
    },
    'team.color': {
      pt: 'Cor do Time',
      en: 'Team Color',
      es: 'Color del Equipo'
    },
    'matches': {
      pt: 'Partidas',
      en: 'Matches',
      es: 'Partidos'
    },
    'matches.manage': {
      pt: 'Gerenciar Partidas',
      en: 'Manage Matches',
      es: 'Administrar Partidos'
    },
    'matches.create': {
      pt: 'Criar Partida',
      en: 'Create Match',
      es: 'Crear Partido'
    },
    'matches.none': {
      pt: 'Nenhuma partida criada ainda',
      en: 'No matches created yet',
      es: 'Ningún partido creado aún'
    },
    'dashboard': {
      pt: 'Painel',
      en: 'Dashboard',
      es: 'Panel'
    },
    'statistics': {
      pt: 'Estatísticas',
      en: 'Statistics',
      es: 'Estadísticas'
    },
    'status': {
      pt: 'Status',
      en: 'Status',
      es: 'Estado'
    },
    'request.sent': {
      pt: 'Solicitação enviada com sucesso!',
      en: 'Request sent successfully!',
      es: '¡Solicitud enviada con éxito!'
    },
    'button.join': {
      pt: 'Participar',
      en: 'Join',
      es: 'Participar'
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
