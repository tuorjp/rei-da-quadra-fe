import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { finalize, catchError, of } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { InscricaoService, InscricaoRequestDTO } from '../../services/inscricao.service';
import { API_CONFIG } from '../../config/api.config';
import {ActivatedRoute} from '@angular/router';

interface Inscricao {
  id: number;
  jogadorNome: string;
  jogadorEmail: string;
  partidasJogadas: number;
  timeAtual?: string;
}

@Component({
  selector: 'app-event-inscriptions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './event-inscriptions.component.html',
  styleUrl: './event-inscriptions.component.css'
})
export class EventInscriptionsComponent implements OnInit {
  @Input() eventoId!: number;

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private inscricaoService = inject(InscricaoService);
  public langService = inject(LanguageService);
  public eventId: string | null;

  inscricoes = signal<Inscricao[]>([]);
  isLoading = signal<boolean>(false);
  isAddingPlayer = signal<boolean>(false);
  showAddForm = signal<boolean>(false);

  playerForm: FormGroup;

  constructor(private route: ActivatedRoute) {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.playerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.carregarLista();
  }

  carregarLista() {
    this.inscricaoService.listarInscricoes(this.eventoId).subscribe({
      next: (response) => {
        this.inscricoes.set(response);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (!this.showAddForm()) {
      this.playerForm.reset();
    }
  }

  onAddPlayer(): void {
    const email = this.playerForm.get('email');

  }

  onRemovePlayer(inscricao: Inscricao): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.langService.translate('player.remove'),
        message: this.langService.translate('player.remove.confirm')
      }
    });


    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.removePlayer(inscricao.id);
      }
    });
  }

  removePlayer(id: number): void {
    this.inscricaoService.removerInscricao(this.eventoId, id).subscribe({
      next: () => {
        this.carregarLista();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
