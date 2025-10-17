// --- MUDANÇA 1: Importe OnInit, OnDestroy e Renderer2 ---
import { Component, inject, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
// import { AuthService } from '../../services/auth.service';

/**
 * Validador customizado para verificar se dois campos coincidem.
 */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('senha');
  const confirmPassword = control.get('confirmarSenha');
  if (!password || !confirmPassword || !password.value || !confirmPassword.value) {
    return null;
  }
  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    confirmPassword.setErrors(null);
    return null;
  }
};

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
// --- MUDANÇA 2: Implemente OnInit e OnDestroy ---
export class CadastroComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage: string | null = null;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  // --- MUDANÇA 3: Injete o Renderer2 ---
  private renderer = inject(Renderer2);
  // private authService = inject(AuthService);

  constructor() {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, {
      validators: passwordMatchValidator
    });
  }

  // --- MUDANÇA 4: Adicione o metodo ngOnInit ---
  // Este metodo é chamado quando o componente é criado e adiciona a classe ao body
  ngOnInit(): void {
    this.renderer.addClass(document.body, 'full-screen-page');
  }

  // --- MUDANÇA 5: Adicione o metodo ngOnDestroy ---
  // Este metodo é chamado quando você sai da página, removendo a classe
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'full-screen-page');
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.isLoading) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    const { confirmarSenha, ...userData } = this.registerForm.value;
    console.log('Dados para cadastro:', userData);

    setTimeout(() => {
      this.isLoading = false;
      console.log('Cadastro realizado com sucesso (simulação)');
    }, 2000);
  }
}
