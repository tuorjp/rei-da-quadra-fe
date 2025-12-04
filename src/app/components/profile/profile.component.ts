import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EditProfileDialogComponent } from '../edit-profile-dialog/edit-profile-dialog.component';
import { UserProfileDTO } from '../../api';
import {RegrasPontuacaoComponent} from '../regras-pontuacao/regras-pontuacao.component';
import {HistoricoPontuacaoComponent} from '../historico-pontuacao/historico-pontuacao.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatDialogModule
  ],
  providers: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userName: string = 'Usuário';
  userEmail: string = '';
  userPhoto: string | null = null;
  skillRating: number = 5.00;
  memberSince: string = 'Carregando...';
  totalMatches: number = 0;
  matchesWon: number = 0;
  nivelHabilidade: string = '';
  userId: number | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  constructor() {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getProfile().subscribe({
      next: (profile: UserProfileDTO) => {
        this.userName = profile.nome || 'Usuário';
        this.userEmail = profile.email || '';

        // Carrega a foto do backend
        this.userPhoto = (profile as any).fotoPerfil || null;

        this.skillRating = (profile as any).pontosHabilidade ?? 1000;
        this.nivelHabilidade = (profile as any).nivelHabilidade ?? 'MEDIANO';

        this.userId = profile.id !== undefined ? profile.id : null;

        this.totalMatches = (profile as any).partidasJogadas || 0;
        this.matchesWon = (profile as any).partidasVencidas || 0;

        // Formata a data
        const dataCriacao = (profile as any).dataCriacao;
        if (dataCriacao) {
          const date = new Date(dataCriacao);
          const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
          this.memberSince = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        } else {
          this.memberSince = 'Data não disponível';
        }
      },
      error: (error) => {
        console.error('Erro ao buscar perfil', error);
      }
    });
  }

  editProfile(): void {
    const dialogRef = this.dialog.open(EditProfileDialogComponent, {
      width: '500px',
      // Passa o nome e a foto atual para o modal de edição
      data: {
        nome: this.userName,
        currentPhoto: this.userPhoto
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Prepara o objeto de atualização
        const updateData = { ...result };

        // Remove campos de senha se estiverem vazios
        if (!updateData.senha) {
          delete updateData.senha;
          delete updateData.confirmarSenha;
        }

        // Se a foto não foi alterada (undefined), remove do payload para não enviar null
        if (updateData.fotoPerfil === undefined) {
          delete updateData.fotoPerfil;
        }

        this.authService.updateProfile(updateData).subscribe({
          next: (newProfile: UserProfileDTO) => {
            // Atualiza os dados na tela com a resposta do backend
            this.userName = newProfile.nome || this.userName;

            // Atualiza a foto se ela veio na resposta
            if ((newProfile as any).fotoPerfil !== undefined) {
              this.userPhoto = (newProfile as any).fotoPerfil;
            }

            this.snackBar.open('Perfil atualizado com sucesso!', 'OK', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (err) => {
            const msg = err.error || 'Erro ao atualizar perfil.';
            this.snackBar.open(msg, 'Fechar', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Deletar Conta',
        message: 'Tem certeza que deseja deletar sua conta? Esta ação é permanente.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteAccount();
      }
    });
  }

  private confirmDeleteAccount(): void {
    const secondDialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Confirmação Final',
        message: 'Deseja realmente continuar? Sua conta será apagada agora.'
      }
    });

    secondDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performAccountDeletion();
      }
    });
  }

  private performAccountDeletion(): void {
    this.authService.deleteAccount().subscribe({
      next: () => {
        this.snackBar.open('Conta deletada com sucesso.', 'Fechar', { duration: 3000 });
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.snackBar.open('Erro ao deletar conta.', 'Fechar', { duration: 3000 });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openRegrasPontuacao(): void {
    this.dialog.open(RegrasPontuacaoComponent, {
      width: '400px'
    });
  }

  // Em profile.component.ts

  openHistoricoPontuacao(): void {
    if (!this.userId) return; // Garante que temos o ID

    // 3. Passa o ID real para o componente de diálogo
    this.dialog.open(HistoricoPontuacaoComponent, {
      width: '500px',
      data: { jogadorId: this.userId }
    });
  }
}
