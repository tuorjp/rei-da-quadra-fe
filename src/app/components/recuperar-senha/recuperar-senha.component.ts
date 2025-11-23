import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-recuperar-senha',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './recuperar-senha.component.html',
  styleUrls: ['./recuperar-senha.component.css']
})
export class RecuperarSenhaComponent {
  form: FormGroup;
  isLoading = false;
  message: string | null = null;
  isSuccess = false;

  private fb = inject(FormBuilder);

  private authService = inject(AuthService);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isLoading) return;

    this.isLoading = true;
    this.message = null;
    this.isSuccess = false;

    const email = this.form.value.email;

    this.authService.recoverPassword(email)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.isSuccess = true;
          this.message = 'Email enviado! Verifique sua caixa de entrada.';
          this.form.disable();
        },
        error: (err: any) => {
          console.error(err);
          this.isSuccess = false;
          this.message = 'Erro ao processar solicitação. Tente novamente.';
        }
      });
  }
}
