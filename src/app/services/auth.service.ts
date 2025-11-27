import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthenticationControllerService, AuthenticationDTO, LoginResponseDTO, UserProfileDTO } from '../api';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'TK';
  private readonly API_URL = 'http://localhost:8090/auth'; // Constante para facilitar

  isLoggedIn = signal<boolean>(false);

  userPhoto = signal<string | null>(null);

  constructor(
    private authApi: AuthenticationControllerService, // Mantemos para o login/getProfile antigos
    private router: Router,
    private http: HttpClient
  ) {
    const token = this.getToken();
    if (token) {
      this.isLoggedIn.set(true);
      this.loadProfilePhoto();
    }
  }

  private loadProfilePhoto(): void {
    this.getProfile().subscribe({
      next: (profile: any) => {
        this.userPhoto.set(profile.fotoPerfil || null);
      },
      error: () => {
        this.userPhoto.set(null);
      }
    });
  }

  login(credentials: AuthenticationDTO): Observable<LoginResponseDTO> {
    console.log(credentials)
    return this.authApi.login(credentials).pipe(
      tap(response => {
        if (response.token) {
          console.log('RESPONSE', response)
          this.saveToken(response.token);
          this.isLoggedIn.set(true);
          this.loadProfilePhoto(); // Atualiza a foto do perfil após o login
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
    this.userPhoto.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  recoverPassword(email: string) {
    // Envia um objeto JSON { "email": "..." } para o backend
    // responseType: 'text' é necessário porque o backend retorna uma String simples, não um JSON
    return this.http.post(`http://localhost:8090/auth/recover-password`, { email }, { responseType: 'text' });
  }
  resetPassword(token: string, password: string) {
    return this.http.post('http://localhost:8090/auth/reset-password', { token, password }, { responseType: 'text' });
  }
  updateProfile(data: any): Observable<UserProfileDTO> {
    return this.http.put<UserProfileDTO>(`${this.API_URL}/profile`, data).pipe(
      tap((updated: any) => {
        if (updated.fotoPerfil !== undefined) {
          this.userPhoto.set(updated.fotoPerfil);
        }
      })
    );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/profile`);
  }
}
