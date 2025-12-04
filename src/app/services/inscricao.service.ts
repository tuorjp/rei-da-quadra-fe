import {Injectable, inject} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface InscricaoResponseDTO {
  id: number;
  jogadorId: number;
  jogadorNome: string;
  jogadorEmail: string;
  partidasJogadas: number;
  timeAtualId?: number;
  timeAtualNome?: string;
  dataInscricao: string;
}

export interface InscricaoRequestDTO {
  jogadorEmail: string;
  jogadorId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class InscricaoService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8090';

  /**
   * Lista todas as inscrições de um evento
   * @param eventoId ID do evento
   * @returns Observable com array de inscrições
   */
  listarInscricoes(eventoId: number): Observable<InscricaoResponseDTO[]> {
    return this.http.get<InscricaoResponseDTO[]>(
      `${this.baseUrl}/eventos/${eventoId}/inscricoes`
    );
  }

  /**
   * Adiciona um jogador ao evento
   * @param eventoId ID do evento
   * @param request Dados da inscrição
   * @returns Observable com a inscrição criada
   */
  adicionarInscricao(eventoId: number, request: InscricaoRequestDTO): Observable<InscricaoResponseDTO> {
    return this.http.post<InscricaoResponseDTO>(
      `${this.baseUrl}/eventos/${eventoId}/inscricoes`,
      request
    );
  }

  /**
   * Remove um jogador do evento
   * @param eventoId ID do evento
   * @param inscricaoId ID da inscrição
   * @returns Observable void
   */
  removerInscricao(eventoId: number, inscricaoId: number): Observable<void> {
    let params: HttpParams = new HttpParams();
    params = params.set('i', inscricaoId);

    return this.http
      .delete<void>(
        `${this.baseUrl}/eventos/${eventoId}/inscricoes/delete`,
        {params}
      );
  }

  /**
   * Busca uma inscrição específica
   * @param eventoId ID do evento
   * @param inscricaoId ID da inscrição
   * @returns Observable com a inscrição
   */
  buscarInscricao(eventoId: number, inscricaoId: number): Observable<InscricaoResponseDTO> {
    return this.http.get<InscricaoResponseDTO>(
      `${this.baseUrl}/eventos/${eventoId}/inscricoes/${inscricaoId}`
    );
  }
}
