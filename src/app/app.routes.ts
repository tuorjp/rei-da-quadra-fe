import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { MyEventsComponent } from './components/my-events/my-events.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { ProfileComponent } from './components/profile/profile.component';

import { CadastroComponent } from './components/cadastro/cadastro.component';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';

import { authGuard } from './config/auth.guard';
import { loginGuard } from './config/login.guard';

export const routes: Routes = [
  // Home protegida
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard]
  },

  // Login
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },

  // Cadastro
  {
    path: 'cadastro',
    component: CadastroComponent,
    canActivate: [loginGuard]
  },

  // *** CONFIRMAR EMAIL (rota livre) ***
  {
    path: 'confirm-email',
    component: ConfirmEmailComponent
  },

  // Perfil
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },

  // Criar evento
  {
    path: 'create-event',
    component: CreateEventComponent,
    canActivate: [authGuard]
  },

  // Meus eventos
  {
    path: 'my-events',
    component: MyEventsComponent,
    canActivate: [authGuard]
  },

  // Detalhes do evento
  {
    path: 'event-details/:id',
    component: EventDetailsComponent,
    canActivate: [authGuard]
  },

  // Wildcard — redireciona para home
  {
    path: '**',
    redirectTo: ''
  }
];
