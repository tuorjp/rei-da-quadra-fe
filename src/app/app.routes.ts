import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
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
    // Redireciona qualquer outra rota para a home
    { path: '**', redirectTo: '' }
];