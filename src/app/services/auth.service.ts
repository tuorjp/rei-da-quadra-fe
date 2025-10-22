import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationControllerService, AuthenticationDTO, LoginResponseDTO, UserProfileDTO } from '../api';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'TK';
  isLoggedIn = signal<boolean>(false);

  constructor(
    private authApi: AuthenticationControllerService,
    private router: Router
  ) {
    const token = this.getToken();
    if (token) {
      this.isLoggedIn.set(true);
    }
  }

  login(credentials: AuthenticationDTO): Observable<LoginResponseDTO> {
    console.log(credentials)
    return this.authApi.login(credentials).pipe(
      tap(response => {
        if (response.token) {
          console.log('RESPONSE', response)
          this.saveToken(response.token);
          this.isLoggedIn.set(true);
          this.router.navigate(['/']); // Redireciona para a home após o login
        }
      })
    );
  }

  getProfile(): Observable<UserProfileDTO> {
    return this.authApi.getProfile();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    // Navega para o login explicitamente no logout
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
}
