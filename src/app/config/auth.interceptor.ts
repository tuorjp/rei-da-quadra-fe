import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let requestToForward = req;

  // 1. Se tiver token, clona a requisição adicionando o header
  if (token) {
    requestToForward = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // 2. Passa a requisição, mas trata os erros
  return next(requestToForward).pipe(
    catchError((error: HttpErrorResponse) => {

      // Log para ajudar no debug (Aperte F12 para ver isso)
      console.error(`Erro na requisição ${req.url}:`, error.status);

      // CASO 1: Token inválido, expirado ou não enviado (401)
      if (error.status === 401) {
        // Evita loop se o erro vier do próprio login
        if (!req.url.includes('/auth/login')) {
          console.warn('Token inválido ou expirado. Realizando logout...');
          authService.logout();
          router.navigate(['/login']);
        }
      }

        // CASO 2: Usuário logado, mas sem permissão para isso (403)
      // NÃO fazemos logout aqui, apenas deixamos o erro passar para o componente tratar
      else if (error.status === 403) {
        console.warn('Acesso negado (403). O usuário não tem permissão para esta ação.');
        // Aqui não chamamos logout!
      }

      // Repassa o erro para o componente que chamou a API
      return throwError(() => error);
    })
  );
};
