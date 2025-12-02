# Requisitos para Implementação de API de Inscrições

## 📋 Status Atual

O frontend já possui:
- ✅ Interface completa de gerenciamento de inscrições
- ✅ Modelo `Inscricao` gerado pela API
- ✅ Componente `EventInscriptionsComponent` funcional com dados mockados

## 🔧 O que precisa ser implementado no BACKEND

### Endpoints Necessários

#### 1. Listar Inscrições de um Evento
```
GET /eventos/{eventoId}/inscricoes
```
**Response:** `Array<InscricaoResponseDTO>`

```typescript
interface InscricaoResponseDTO {
  id: number;
  jogadorId: number;
  jogadorNome: string;
  jogadorEmail: string;
  partidasJogadas: number;
  timeAtualId?: number;
  timeAtualNome?: string;
  dataInscricao: string;
}
```

#### 2. Adicionar Jogador ao Evento
```
POST /eventos/{eventoId}/inscricoes
```
**Request Body:** `InscricaoRequestDTO`
```typescript
interface InscricaoRequestDTO {
  jogadorEmail: string;  // Email do jogador a ser inscrito
  // OU
  jogadorId?: number;    // ID do jogador (se já cadastrado)
}
```
**Response:** `InscricaoResponseDTO`

#### 3. Remover Jogador do Evento
```
DELETE /eventos/{eventoId}/inscricoes/{inscricaoId}
```
**Response:** `204 No Content`

#### 4. Buscar Inscrição Específica
```
GET /eventos/{eventoId}/inscricoes/{inscricaoId}
```
**Response:** `InscricaoResponseDTO`

### Regras de Negócio Sugeridas

1. **Validações:**
   - Apenas o organizador do evento pode adicionar/remover inscrições
   - Não permitir inscrições duplicadas (mesmo jogador no mesmo evento)
   - Validar se o evento está ativo antes de permitir inscrições

2. **Comportamentos:**
   - Ao remover uma inscrição, verificar se o jogador está em algum time
   - Ao adicionar, se o email não existir, pode criar um convite ou retornar erro
   - Incrementar `partidasJogadas` automaticamente quando o jogador participa de uma partida

## 🔄 O que precisa ser feito no FRONTEND

### 1. Regenerar a API Client

Após implementar os endpoints no backend, execute:

```bash
npm run generate-api
```

Isso irá gerar automaticamente o serviço TypeScript com os novos endpoints.

### 2. Criar o Service de Inscrições (se não for gerado automaticamente)

Se o gerador não criar um `InscricaoControllerService`, você pode criar manualmente:

```typescript
// src/app/services/inscricao.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  listarInscricoes(eventoId: number): Observable<InscricaoResponseDTO[]> {
    return this.http.get<InscricaoResponseDTO[]>(
      `${this.baseUrl}/eventos/${eventoId}/inscricoes`
    );
  }

  adicionarInscricao(eventoId: number, request: InscricaoRequestDTO): Observable<InscricaoResponseDTO> {
    return this.http.post<InscricaoResponseDTO>(
      `${this.baseUrl}/eventos/${eventoId}/inscricoes`,
      request
    );
  }

  removerInscricao(eventoId: number, inscricaoId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/eventos/${eventoId}/inscricoes/${inscricaoId}`
    );
  }

  buscarInscricao(eventoId: number, inscricaoId: number): Observable<InscricaoResponseDTO> {
    return this.http.get<InscricaoResponseDTO>(
      `${this.baseUrl}/eventos/${eventoId}/inscricoes/${inscricaoId}`
    );
  }
}
```

### 3. Atualizar o EventInscriptionsComponent

Substituir os dados mockados pelas chamadas reais:

```typescript
// src/app/components/event-inscriptions/event-inscriptions.component.ts

import { InscricaoService } from '../../services/inscricao.service';

export class EventInscriptionsComponent implements OnInit {
  private inscricaoService = inject(InscricaoService);
  
  loadInscricoes(): void {
    this.isLoading.set(true);
    
    this.inscricaoService.listarInscricoes(this.eventoId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (inscricoes) => {
          this.inscricoes.set(inscricoes.map(i => ({
            id: i.id,
            jogadorNome: i.jogadorNome,
            jogadorEmail: i.jogadorEmail,
            partidasJogadas: i.partidasJogadas,
            timeAtual: i.timeAtualNome
          })));
        },
        error: (error) => {
          console.error('Erro ao carregar inscrições:', error);
          this.snackBar.open(
            'Erro ao carregar inscrições',
            'OK',
            { duration: 5000 }
          );
        }
      });
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
            'Jogador adicionado com sucesso!',
            'OK',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Erro ao adicionar jogador:', error);
          this.snackBar.open(
            error.error?.message || 'Erro ao adicionar jogador',
            'OK',
            { duration: 5000 }
          );
        }
      });
  }

  removePlayer(id: number): void {
    this.inscricaoService.removerInscricao(this.eventoId, id)
      .subscribe({
        next: () => {
          this.inscricoes.update(list => list.filter(i => i.id !== id));
          this.snackBar.open(
            'Jogador removido com sucesso!',
            'OK',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Erro ao remover jogador:', error);
          this.snackBar.open(
            'Erro ao remover jogador',
            'OK',
            { duration: 5000 }
          );
        }
      });
  }
}
```

## 📝 Checklist de Implementação

### Backend
- [ ] Criar `InscricaoController` com os 4 endpoints
- [ ] Criar `InscricaoRequestDTO` e `InscricaoResponseDTO`
- [ ] Implementar validações de segurança (apenas organizador)
- [ ] Implementar validações de negócio (duplicatas, evento ativo)
- [ ] Adicionar testes unitários
- [ ] Documentar endpoints no Swagger

### Frontend
- [ ] Executar `npm run generate-api` após backend pronto
- [ ] Criar `InscricaoService` (se necessário)
- [ ] Atualizar `EventInscriptionsComponent` com chamadas reais
- [ ] Adicionar tratamento de erros específicos
- [ ] Testar fluxo completo de inscrições
- [ ] Adicionar loading states apropriados

## 🚀 Ordem de Implementação Recomendada

1. **Backend:** Implementar endpoints de inscrição
2. **Backend:** Testar endpoints com Postman/Insomnia
3. **Frontend:** Regenerar API client
4. **Frontend:** Atualizar componente com chamadas reais
5. **Teste E2E:** Validar fluxo completo

## 💡 Melhorias Futuras

- Adicionar paginação na lista de inscrições
- Implementar busca/filtro de jogadores
- Adicionar status da inscrição (pendente, confirmada, cancelada)
- Permitir que jogadores se auto-inscrevam via link público
- Adicionar notificações por email ao adicionar jogador
