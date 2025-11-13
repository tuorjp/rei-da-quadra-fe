import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  imports: [
    CommonModule,
    MatProgressSpinner
  ],
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  message: string = '';
  isLoading: boolean = true;
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.http.get(`http://localhost:8090/auth/confirm?token=${token}`, { responseType: 'text' })
        .subscribe({
          next: (res) => {
            this.message = res;
            this.isSuccess = true;
            this.isLoading = false;

            // Redireciona automaticamente (1,5s)
            setTimeout(() => this.router.navigate(['/login']), 1500);
          },
          error: (err) => {
            this.message = err.error || 'Erro ao confirmar o email. O token pode estar expirado.';
            this.isSuccess = false;
            this.isLoading = false;
          }
        });
    } else {
      this.message = 'Token não encontrado na URL.';
      this.isLoading = false;
      this.isSuccess = false;
    }
  }
}
