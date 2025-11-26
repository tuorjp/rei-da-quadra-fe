/**
 * Configurações da API
 * 
 * USE_MOCK_DATA: Define se deve usar dados mockados ou chamadas reais à API
 * - true: Usa dados simulados (útil para desenvolvimento sem backend)
 * - false: Usa chamadas reais à API (requer backend rodando)
 */

export const API_CONFIG = {
  // Trocar para false quando a API de inscrições estiver implementada no backend
  USE_MOCK_INSCRICOES: true,
  
  // URL base da API
  BASE_URL: 'http://localhost:8090',
  
  // Timeout padrão para requisições (em ms)
  DEFAULT_TIMEOUT: 30000
} as const;

/**
 * Status de implementação das APIs
 */
export const API_STATUS = {
  eventos: {
    implemented: true,
    endpoints: ['GET /eventos', 'POST /eventos', 'GET /eventos/{id}', 'PATCH /eventos/{id}', 'DELETE /eventos/{id}']
  },
  inscricoes: {
    implemented: false, // Trocar para true quando implementado
    endpoints: [
      'GET /eventos/{eventoId}/inscricoes',
      'POST /eventos/{eventoId}/inscricoes',
      'DELETE /eventos/{eventoId}/inscricoes/{inscricaoId}',
      'GET /eventos/{eventoId}/inscricoes/{inscricaoId}'
    ]
  },
  times: {
    implemented: false, // Verificar e atualizar
    endpoints: []
  },
  partidas: {
    implemented: false, // Verificar e atualizar
    endpoints: []
  }
} as const;
