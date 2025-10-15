import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EventoControllerService } from '../../api/api/eventoController.service';
import { EventoRequestDTO } from '../../api/model/eventoRequestDTO';
import { LanguageService } from '../../services/language.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-event',
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
    MatSnackBarModule
  ],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.css'
})
export class CreateEventComponent {
  private fb = inject(FormBuilder);
  private eventoService = inject(EventoControllerService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  public langService = inject(LanguageService);

  eventForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.eventForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      local: ['', Validators.required],
      dataHorario: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid || this.isSubmitting) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const eventoRequest: EventoRequestDTO = {
      ...this.eventForm.value,
      dataHorario: new Date(this.eventForm.value.dataHorario).toISOString()
    };

    this.eventoService.criarEvento(eventoRequest)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (response) => {
          console.log('Evento criado com sucesso:', response);
          this.snackBar.open(
            this.langService.translate('event.created.success'),
            'OK',
            { duration: 3000 }
          );
          this.router.navigate(['/my-events']);
        },
        error: (error) => {
          console.error('Erro ao criar evento:', error);
          this.snackBar.open(
            this.langService.translate('event.created.error'),
            'OK',
            { duration: 5000 }
          );
        }
      });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }
}

