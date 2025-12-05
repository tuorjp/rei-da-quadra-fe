import { Component, inject, Input, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
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
import {DragDropModule, CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatTooltip, MatTooltipModule} from '@angular/material/tooltip';

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
    MatDividerModule,
    DragDropModule,
    MatTooltip
  ],
  templateUrl: './event-inscriptions.component.html',
  styleUrl: './event-inscriptions.component.css'
})
export class EventInscriptionsComponent implements OnInit, OnChanges {
  @Input() eventoId!: number;
  @Input() isOrganizer: boolean = false;

  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private inscricaoService = inject(InscricaoService);
  public langService = inject(LanguageService);
  public eventId: string | null;

  inscricoes = signal<Inscricao[]>([]);
  solicitacoesPendentes = signal<any[]>([]);
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
    console.log('EventInscriptionsComponent ngOnInit - isOrganizer:', this.isOrganizer);
    console.log('EventInscriptionsComponent ngOnInit - eventoId:', this.eventoId);

    this.carregarLista();
    this.verificarECarregarSolicitacoes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('EventInscriptionsComponent ngOnChanges:', changes);

    if (changes['isOrganizer'] && !changes['isOrganizer'].firstChange) {
      console.log('isOrganizer mudou para:', changes['isOrganizer'].currentValue);
      this.verificarECarregarSolicitacoes();
    }
  }

  verificarECarregarSolicitacoes(): void {
    console.log('verificarECarregarSolicitacoes - isOrganizer:', this.isOrganizer);
    if (this.isOrganizer && this.eventoId) {
      console.log('Carregando solicitações pendentes...');
      this.carregarSolicitacoesPendentes();
    } else {
      console.log('Não carregando solicitações. isOrganizer:', this.isOrganizer, 'eventoId:', this.eventoId);
    }
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

  carregarSolicitacoesPendentes() {
    console.log('Chamando API para listar solicitações pendentes...');
    this.inscricaoService.listarSolicitacoesPendentes(this.eventoId).subscribe({
      next: async (response: any) => {
        console.log('Solicitações pendentes recebidas (raw):', response);

        let solicitacoes: any[] = [];

        // Verificar se a resposta é um Blob e converter
        if (response instanceof Blob) {
          console.log('Resposta é Blob, convertendo...');
          const blobText = await response.text();
          solicitacoes = JSON.parse(blobText);
        } else {
          solicitacoes = response;
        }

        console.log('Solicitações pendentes processadas:', solicitacoes);
        this.solicitacoesPendentes.set(solicitacoes);
      },
      error: (err) => {
        console.error('Erro ao carregar solicitações:', err);
      }
    });
  }

  aprovarSolicitacao(solicitacaoId: number) {
    this.inscricaoService.aprovarSolicitacao(this.eventoId, solicitacaoId).subscribe({
      next: () => {
        this.snackBar.open(
          'Solicitação aprovada com sucesso!',
          'OK',
          { duration: 3000 }
        );
        this.carregarSolicitacoesPendentes();
        this.carregarLista();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(
          'Erro ao aprovar solicitação',
          'OK',
          { duration: 5000 }
        );
      }
    });
  }

  rejeitarSolicitacao(solicitacaoId: number) {
    this.inscricaoService.rejeitarSolicitacao(this.eventoId, solicitacaoId).subscribe({
      next: () => {
        this.snackBar.open(
          'Solicitação rejeitada',
          'OK',
          { duration: 3000 }
        );
        this.carregarSolicitacoesPendentes();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(
          'Erro ao rejeitar solicitação',
          'OK',
          { duration: 5000 }
        );
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

    const request: InscricaoRequestDTO = {
      jogadorEmail: this.playerForm.value.email
    };

    this.inscricaoService.adicionarInscricao(this.eventoId, request)
      .pipe(finalize(() => this.isAddingPlayer.set(false)))
      .subscribe({
        next: (inscricao) => {
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
            this.langService.translate('player.added.success') || 'Jogador adicionado com sucesso!',
            'OK',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Erro ao adicionar jogador:', error);
          this.snackBar.open(
            error.error?.message || this.langService.translate('player.added.error') || 'Erro ao adicionar jogador',
            'OK',
            { duration: 5000 }
          );
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
    this.inscricaoService.removerInscricao(this.eventoId, id).subscribe({
      next: () => {
        this.carregarLista();
        this.snackBar.open(
          this.langService.translate('player.removed.success'),
          'OK',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(
          this.langService.translate('player.removed.error'),
          'OK',
          { duration: 5000 }
        );
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    // Apenas organizadores podem mover
    if (!this.isOrganizer) return;

    // Atualiza a lista visualmente
    const currentList = this.inscricoes();
    moveItemInArray(currentList, event.previousIndex, event.currentIndex);
    this.inscricoes.set([...currentList]); // Dispara a atualização do sinal
  }
}
