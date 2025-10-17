import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { MyEventsComponent } from './components/my-events/my-events.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './config/auth.guard';
import { loginGuard } from './config/login.guard';
import { CadastroComponent } from './components/cadastro/cadastro.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]
  },

  {
    path: 'cadastro',
    component: CadastroComponent,
    canActivate: [loginGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'create-event',
    component: CreateEventComponent,
    canActivate: [authGuard]
  },
  {
    path: 'my-events',
    component: MyEventsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'event-details/:id',
    component: EventDetailsComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
