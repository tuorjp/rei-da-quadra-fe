import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HistoryItem {
  data: string;
  acao: string;
  variacao: number;
  pontosFinais: number;
  nomePartida?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PontuacaoService {

  private baseUrl = 'http://localhost:8090/pontuacao';

  constructor(private http: HttpClient) {}

  /** Busca extrato completo de pontuação do jogador */
  getHistorico(jogadorId: number): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.baseUrl}/historico/${jogadorId}`);
  }
}
