import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o token existe (ajuste a lógica conforme seu AuthService)
  const token = authService.getToken();

  if (token) {
    return true; // Token existe, permite acesso
  } else {
    router.navigate(['/login']); // Sem token, manda pro login
    return false;
  }
};
