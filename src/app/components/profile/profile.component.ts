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
import { UserProfileDTO } from '../../api'; // 1. Importação da tipagem

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
  skillRating: number = 5.00;
  memberSince: string = 'Carregando...';
  totalEvents: number = 0;
  eventsWon: number = 0;

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
        // Garante que não será undefined
        this.userName = profile.nome || 'Usuário';
        this.userEmail = profile.email || '';

        // Cast para 'any' pois o campo pode não existir na definição antiga do Swagger
        const dataCriacao = (profile as any).dataCriacao;

        if (dataCriacao) {
          const date = new Date(dataCriacao);
          const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric' , month: 'long', year: 'numeric' });
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
      data: { nome: this.userName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Remove campos vazios de senha
        const updateData = { ...result };
        if (!updateData.senha) {
          delete updateData.senha;
          delete updateData.confirmarSenha;
        }

        this.authService.updateProfile(updateData).subscribe({
          next: (newProfile: UserProfileDTO) => {
            // CORREÇÃO CRÍTICA AQUI:
            // O operador || garante que se o backend não devolver o nome, mantém o atual.
            // Isso resolve o erro TS2322.
            this.userName = newProfile.nome || this.userName;

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
}
