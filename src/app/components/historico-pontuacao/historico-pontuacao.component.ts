import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PontuacaoService, HistoryItem } from '../../api/api/pontuacao.service';

interface HistoryGroup {
  date: string;
  items: HistoryItem[];
}

@Component({
  selector: 'app-historico-pontuacao',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [DatePipe],
  templateUrl: './historico-pontuacao.component.html',
  styleUrls: ['./historico-pontuacao.component.css']
})
export class HistoricoPontuacaoComponent implements OnInit {

  groupedHistory: HistoryGroup[] = [];
  loading = true;

  constructor(
    private pontuacaoService: PontuacaoService,
    @Inject(MAT_DIALOG_DATA) public data: { jogadorId: number }
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory() {
    this.pontuacaoService.getHistorico(this.data.jogadorId).subscribe({
      next: (history: HistoryItem[]) => {
        this.processHistory(history);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar histórico', err);
        this.loading = false;
      }
    });
  }

  private processHistory(history: HistoryItem[]) {
    if (!history || history.length === 0) {
      this.groupedHistory = [];
      return;
    }

    const sorted = [...history].sort((a, b) =>
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    const groups: Record<string, HistoryItem[]> = {};

    sorted.forEach(item => {
      const dateKey = new Date(item.data).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    this.groupedHistory = Object.keys(groups).map(dateKey => ({
      date: dateKey,
      items: groups[dateKey]
    }));
  }
}
