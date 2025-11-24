import { Router, RouterLink } from '@angular/router';
import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;

  // Controle de erros
  errorMessage: string | null = null; // Para erros genéricos
  showLoginError = false; // Para erro de credenciais (com link)

  hidePassword = true;

  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  private router = inject(Router);
  public languageService = inject(LanguageService);
  private renderer = inject(Renderer2);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'login-page-active');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'login-page-active');
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.showLoginError = false; // Reseta o estado do erro específico

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          console.log('Login bem-sucedido!');
        },
        error: (err) => {
          console.error('Falha no login', err);

          // Se for erro 401 (Unauthorized) ou 403 (Forbidden), mostra a mensagem com link
          if (err.status === 401 || err.status === 403) {
            this.showLoginError = true;
          } else {
            // Outros erros (ex: servidor fora do ar)
            this.errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
          }
        }
      });
  }
}
