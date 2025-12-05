import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Se o usuário já está logado, redireciona para a home
    // e impede o acesso à rota de login.
    router.navigate(['/home']);
    return false;
  }

  // Se não está logado, permite o acesso à rota de login.
  return true;
};
