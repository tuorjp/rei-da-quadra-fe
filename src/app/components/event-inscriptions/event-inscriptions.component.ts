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

  inscricoes = signal<Inscricao[]>([]);
  isLoading = signal<boolean>(false);
  isAddingPlayer = signal<boolean>(false);
  showAddForm = signal<boolean>(false);
  useMockData = signal<boolean>(API_CONFIG.USE_MOCK_INSCRICOES);

  playerForm: FormGroup;

  constructor() {
    this.playerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadInscricoes();
  }

  loadInscricoes(): void {
    this.isLoading.set(true);
    
    if (this.useMockData()) {
      // Dados mockados para desenvolvimento
      setTimeout(() => {
        this.inscricoes.set([
          {
            id: 1,
            jogadorNome: 'João Silva',
            jogadorEmail: 'joao@email.com',
            partidasJogadas: 5,
            timeAtual: 'Time A'
          },
          {
            id: 2,
            jogadorNome: 'Maria Santos',
            jogadorEmail: 'maria@email.com',
            partidasJogadas: 3,
            timeAtual: 'Time B'
          },
          {
            id: 3,
            jogadorNome: 'Pedro Oliveira',
            jogadorEmail: 'pedro@email.com',
            partidasJogadas: 7,
            timeAtual: 'Time A'
          }
        ]);
        this.isLoading.set(false);
      }, 500);
      return;
    }

    // Chamada real à API
    this.inscricaoService.listarInscricoes(this.eventoId)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        catchError((error) => {
          console.error('Erro ao carregar inscrições:', error);
          this.snackBar.open(
            this.langService.translate('event.load.error'),
            'OK',
            { duration: 5000 }
          );
          return of([]);
        })
      )
      .subscribe({
        next: (inscricoes) => {
          this.inscricoes.set(inscricoes.map(i => ({
            id: i.id,
            jogadorNome: i.jogadorNome,
            jogadorEmail: i.jogadorEmail,
            partidasJogadas: i.partidasJogadas,
            timeAtual: i.timeAtualNome
          })));
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
    if (this.playerForm.invalid || this.isAddingPlayer()) {
      this.playerForm.markAllAsTouched();
      return;
    }

    this.isAddingPlayer.set(true);

    if (this.useMockData()) {
      // Simulação para desenvolvimento
      setTimeout(() => {
        const newPlayer: Inscricao = {
          id: this.inscricoes().length + 1,
          jogadorNome: this.playerForm.value.nome,
          jogadorEmail: this.playerForm.value.email,
          partidasJogadas: 0
        };

        this.inscricoes.update(list => [...list, newPlayer]);
        this.playerForm.reset();
        this.showAddForm.set(false);
        this.isAddingPlayer.set(false);

        this.snackBar.open(
          'Jogador adicionado com sucesso!',
          'OK',
          { duration: 3000 }
        );
      }, 500);
      return;
    }

    // Chamada real à API
    const request: InscricaoRequestDTO = {
      jogadorEmail: this.playerForm.value.email
    };

    this.inscricaoService.adicionarInscricao(this.eventoId, request)
      .pipe(
        finalize(() => this.isAddingPlayer.set(false)),
        catchError((error) => {
          console.error('Erro ao adicionar jogador:', error);
          const errorMessage = error.error?.message || 'Erro ao adicionar jogador. Tente novamente.';
          this.snackBar.open(errorMessage, 'OK', { duration: 5000 });
          return of(null);
        })
      )
      .subscribe({
        next: (inscricao) => {
          if (inscricao) {
            this.inscricoes.update(list => [...list, {
              id: inscricao.id,
              jogadorNome: inscricao.jogadorNome,
              jogadorEmail: inscricao.jogadorEmail,
              partidasJogadas: inscricao.partidasJogadas,
              timeAtual: inscricao.timeAtualNome
            }]);
            
            this.playerForm.reset();
            this.showAddForm.set(false);
            
            this.snackBar.open(
              'Jogador adicionado com sucesso!',
              'OK',
              { duration: 3000 }
            );
          }
        }
      });
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
    if (this.useMockData()) {
      // Simulação para desenvolvimento
      this.inscricoes.update(list => list.filter(i => i.id !== id));
      this.snackBar.open(
        'Jogador removido com sucesso!',
        'OK',
        { duration: 3000 }
      );
      return;
    }

    // Chamada real à API
    this.inscricaoService.removerInscricao(this.eventoId, id)
      .pipe(
        catchError((error) => {
          console.error('Erro ao remover jogador:', error);
          this.snackBar.open(
            'Erro ao remover jogador. Tente novamente.',
            'OK',
            { duration: 5000 }
          );
          return of(null);
        })
      )
      .subscribe({
        next: () => {
          this.inscricoes.update(list => list.filter(i => i.id !== id));
          this.snackBar.open(
            'Jogador removido com sucesso!',
            'OK',
            { duration: 3000 }
          );
        }
      });
  }
}
