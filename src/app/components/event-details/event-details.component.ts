import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { EventoControllerService } from '../../api/api/eventoController.service';
import { EventoResponseDTO } from '../../api/model/eventoResponseDTO';
import { LanguageService } from '../../services/language.service';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EventInscriptionsComponent } from '../event-inscriptions/event-inscriptions.component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    EventInscriptionsComponent
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private eventoService = inject(EventoControllerService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  public langService = inject(LanguageService);

  evento = signal<EventoResponseDTO | null>(null);
  isLoading = signal<boolean>(true);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  eventForm: FormGroup;

  constructor() {
    this.eventForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      local: ['', Validators.required],
      dataHorario: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(+id);
    }
  }

  loadEvent(id: number): void {
    this.isLoading.set(true);

    this.eventoService.buscarEvento(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (evento) => {
          this.evento.set(evento);
          this.populateForm(evento);
        },
        error: (error) => {
          console.error('Erro ao carregar evento:', error);
          this.snackBar.open(
            this.langService.translate('event.load.error'),
            'OK',
            { duration: 5000 }
          );
          this.router.navigate(['/my-events']);
        }
      });
  }

  populateForm(evento: EventoResponseDTO): void {
    let dateTimeValue = '';
    const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (evento.dataHorario) {
      dateTimeValue = dayjs.utc(evento.dataHorario).tz(userZone).format("YYYY-MM-DDTHH:mm");
    }

    this.eventForm.patchValue({
      nome: evento.nome || '',
      local: evento.local || '',
      dataHorario: dateTimeValue
    });
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing() && this.evento()) {
      // Se cancelar edição, restaurar valores originais
      this.populateForm(this.evento()!);
    }
  }

  onSave(): void {
    if (this.eventForm.invalid || this.isSaving() || !this.evento()?.id) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const updates: { [key: string]: any } = {};

    if (this.eventForm.value.nome !== this.evento()?.nome) {
      updates['nome'] = this.eventForm.value.nome;
    }
    if (this.eventForm.value.local !== this.evento()?.local) {
      updates['local'] = this.eventForm.value.local;
    }

    const localDateTime = this.eventForm.value.dataHorario;
    if (localDateTime) {
      const userZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const parsed = dayjs.tz(localDateTime, "YYYY-MM-DDTHH:mm", userZone);
      const utcIso = parsed.utc().toISOString();

      if(utcIso!== this.evento()?.dataHorario){
        updates['dataHorario'] = utcIso;
      }
    }

    if (Object.keys(updates).length === 0) {
      this.isEditing.set(false);
      this.isSaving.set(false);
      return;
    }

    this.eventoService.atualizarEventoParcial(this.evento()!.id!, updates)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (eventoAtualizado) => {
          this.evento.set(eventoAtualizado);
          this.isEditing.set(false);
          this.snackBar.open(
            this.langService.translate('event.updated.success'),
            'OK',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Erro ao atualizar evento:', error);
          this.snackBar.open(
            this.langService.translate('event.updated.error'),
            'OK',
            { duration: 5000 }
          );
        }
      });
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.langService.translate('delete.event'),
        message: this.langService.translate('delete.event.confirm')
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.evento()?.id) {
        this.deleteEvent(this.evento()!.id!);
      }
    });
  }

  deleteEvent(id: number): void {
    this.eventoService.deletarEvento(id)
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.langService.translate('event.deleted.success'),
            'OK',
            { duration: 3000 }
          );
          this.router.navigate(['/my-events']);
        },
        error: (error) => {
          console.error('Erro ao deletar evento:', error);
          this.snackBar.open(
            this.langService.translate('event.deleted.error'),
            'OK',
            { duration: 5000 }
          );
        }
      });
  }

  onBack(): void {
    this.router.navigate(['/my-events']);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(this.langService.currentLanguage());
  }
}

