import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { MyEventsComponent } from './components/my-events/my-events.component';
import { EventDetailsComponent } from './components/event-details/event-details.component';
import { authGuard } from './config/auth.guard';
import { loginGuard } from './config/login.guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [authGuard] // Protege a rota principal
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard]
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
    // Redireciona qualquer outra rota para a home
    { path: '**', redirectTo: '' }
];
