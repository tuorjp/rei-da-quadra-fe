import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  userName: string = 'Usuário';
  userEmail: string = '';
  skillRating: number = 5.00;
  memberSince: string = '';
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
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userName = payload.nome || payload.username || payload.nome || payload.sub || 'Usuário';
        this.userEmail = payload.email || payload.sub || '';
        console.log('Token payload:', payload);
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        this.userName = 'Usuário';
      }
    }

    this.memberSince = 'Janeiro 2025';
  }

  editProfile(): void {
    console.log('Editar perfil');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Deletar Conta',
        message: 'Tem certeza que deseja deletar sua conta? Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão perdidos.'
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
        message: 'Esta é a última confirmação. Após clicar em confirmar, sua conta será deletada permanentemente. Deseja continuar?'
      }
    });

    secondDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performAccountDeletion();
      }
    });
  }

  private performAccountDeletion(): void {
    this.snackBar.open('Conta deletada com sucesso', 'Fechar', {
      duration: 4000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    }, 1500);
  }
}

