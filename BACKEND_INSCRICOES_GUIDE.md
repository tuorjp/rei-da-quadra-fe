# Guia de Implementação - API de Inscrições (Backend)

## 🎯 Objetivo

Implementar os endpoints REST para gerenciar inscrições de jogadores em eventos.

## 📋 Endpoints a Implementar

### 1. Listar Inscrições do Evento

```java
@GetMapping("/eventos/{eventoId}/inscricoes")
public ResponseEntity<List<InscricaoResponseDTO>> listarInscricoes(
    @PathVariable Long eventoId,
    @AuthenticationPrincipal User user
) {
    // Implementação
}
```

**Validações:**
- Verificar se o evento existe
- Verificar se o usuário tem permissão (é o organizador ou participante)

**Response:**
```json
[
  {
    "id": 1,
    "jogadorId": 10,
    "jogadorNome": "João Silva",
    "jogadorEmail": "joao@email.com",
    "partidasJogadas": 5,
    "timeAtualId": 2,
    "timeAtualNome": "Time A",
    "dataInscricao": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Adicionar Jogador ao Evento

```java
@PostMapping("/eventos/{eventoId}/inscricoes")
public ResponseEntity<InscricaoResponseDTO> adicionarInscricao(
    @PathVariable Long eventoId,
    @RequestBody @Valid InscricaoRequestDTO request,
    @AuthenticationPrincipal User user
) {
    // Implementação
}
```

**Request Body:**
```json
{
  "jogadorEmail": "novo@email.com",
  "jogadorId": 15  // Opcional, se já existir
}
```

**Validações:**
- Apenas o organizador pode adicionar jogadores
- Verificar se o jogador já está inscrito
- Verificar se o evento está ativo
- Se jogadorId não for fornecido, buscar por email ou criar convite

**Response:** Status 201 Created + InscricaoResponseDTO

### 3. Remover Jogador do Evento

```java
@DeleteMapping("/eventos/{eventoId}/inscricoes/{inscricaoId}")
public ResponseEntity<Void> removerInscricao(
    @PathVariable Long eventoId,
    @PathVariable Long inscricaoId,
    @AuthenticationPrincipal User user
) {
    // Implementação
}
```

**Validações:**
- Apenas o organizador pode remover jogadores
- Verificar se a inscrição pertence ao evento
- Verificar se o jogador não está em uma partida em andamento

**Response:** Status 204 No Content

### 4. Buscar Inscrição Específica

```java
@GetMapping("/eventos/{eventoId}/inscricoes/{inscricaoId}")
public ResponseEntity<InscricaoResponseDTO> buscarInscricao(
    @PathVariable Long eventoId,
    @PathVariable Long inscricaoId,
    @AuthenticationPrincipal User user
) {
    // Implementação
}
```

**Response:** InscricaoResponseDTO

## 📦 DTOs Necessários

### InscricaoRequestDTO

```java
package com.reidaquadra.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InscricaoRequestDTO {
    
    @Email(message = "Email inválido")
    @NotBlank(message = "Email é obrigatório")
    private String jogadorEmail;
    
    private Long jogadorId; // Opcional
}
```

### InscricaoResponseDTO

```java
package com.reidaquadra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InscricaoResponseDTO {
    
    private Long id;
    private Long jogadorId;
    private String jogadorNome;
    private String jogadorEmail;
    private Integer partidasJogadas;
    private Long timeAtualId;
    private String timeAtualNome;
    private LocalDateTime dataInscricao;
    
    // Método estático para converter de Inscricao para DTO
    public static InscricaoResponseDTO fromEntity(Inscricao inscricao) {
        return InscricaoResponseDTO.builder()
            .id(inscricao.getId())
            .jogadorId(inscricao.getJogador().getId())
            .jogadorNome(inscricao.getJogador().getNome())
            .jogadorEmail(inscricao.getJogador().getEmail())
            .partidasJogadas(inscricao.getPartidasJogadas())
            .timeAtualId(inscricao.getTimeAtual() != null ? inscricao.getTimeAtual().getId() : null)
            .timeAtualNome(inscricao.getTimeAtual() != null ? inscricao.getTimeAtual().getNome() : null)
            .dataInscricao(inscricao.getDataInscricao())
            .build();
    }
}
```

## 🔧 Service Layer

### InscricaoService

```java
package com.reidaquadra.service;

import com.reidaquadra.dto.InscricaoRequestDTO;
import com.reidaquadra.dto.InscricaoResponseDTO;
import com.reidaquadra.entity.Evento;
import com.reidaquadra.entity.Inscricao;
import com.reidaquadra.entity.User;
import com.reidaquadra.exception.BusinessException;
import com.reidaquadra.repository.EventoRepository;
import com.reidaquadra.repository.InscricaoRepository;
import com.reidaquadra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InscricaoService {
    
    private final InscricaoRepository inscricaoRepository;
    private final EventoRepository eventoRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public List<InscricaoResponseDTO> listarInscricoes(Long eventoId, User currentUser) {
        Evento evento = eventoRepository.findById(eventoId)
            .orElseThrow(() -> new BusinessException("Evento não encontrado"));
        
        // Verificar permissão (organizador ou participante)
        validarPermissaoLeitura(evento, currentUser);
        
        return inscricaoRepository.findByEventoId(eventoId).stream()
            .map(InscricaoResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public InscricaoResponseDTO adicionarInscricao(Long eventoId, InscricaoRequestDTO request, User currentUser) {
        Evento evento = eventoRepository.findById(eventoId)
            .orElseThrow(() -> new BusinessException("Evento não encontrado"));
        
        // Apenas organizador pode adicionar
        if (!evento.getUsuario().getId().equals(currentUser.getId())) {
            throw new BusinessException("Apenas o organizador pode adicionar jogadores");
        }
        
        // Buscar ou criar jogador
        User jogador;
        if (request.getJogadorId() != null) {
            jogador = userRepository.findById(request.getJogadorId())
                .orElseThrow(() -> new BusinessException("Jogador não encontrado"));
        } else {
            jogador = userRepository.findByEmail(request.getJogadorEmail())
                .orElseThrow(() -> new BusinessException("Jogador não encontrado com este email"));
        }
        
        // Verificar se já está inscrito
        if (inscricaoRepository.existsByEventoIdAndJogadorId(eventoId, jogador.getId())) {
            throw new BusinessException("Jogador já está inscrito neste evento");
        }
        
        // Criar inscrição
        Inscricao inscricao = new Inscricao();
        inscricao.setEvento(evento);
        inscricao.setJogador(jogador);
        inscricao.setPartidasJogadas(0);
        inscricao.setDataInscricao(LocalDateTime.now());
        
        inscricao = inscricaoRepository.save(inscricao);
        
        return InscricaoResponseDTO.fromEntity(inscricao);
    }
    
    @Transactional
    public void removerInscricao(Long eventoId, Long inscricaoId, User currentUser) {
        Evento evento = eventoRepository.findById(eventoId)
            .orElseThrow(() -> new BusinessException("Evento não encontrado"));
        
        // Apenas organizador pode remover
        if (!evento.getUsuario().getId().equals(currentUser.getId())) {
            throw new BusinessException("Apenas o organizador pode remover jogadores");
        }
        
        Inscricao inscricao = inscricaoRepository.findById(inscricaoId)
            .orElseThrow(() -> new BusinessException("Inscrição não encontrada"));
        
        // Verificar se a inscrição pertence ao evento
        if (!inscricao.getEvento().getId().equals(eventoId)) {
            throw new BusinessException("Inscrição não pertence a este evento");
        }
        
        // TODO: Verificar se jogador não está em partida em andamento
        
        inscricaoRepository.delete(inscricao);
    }
    
    @Transactional(readOnly = true)
    public InscricaoResponseDTO buscarInscricao(Long eventoId, Long inscricaoId, User currentUser) {
        Evento evento = eventoRepository.findById(eventoId)
            .orElseThrow(() -> new BusinessException("Evento não encontrado"));
        
        validarPermissaoLeitura(evento, currentUser);
        
        Inscricao inscricao = inscricaoRepository.findById(inscricaoId)
            .orElseThrow(() -> new BusinessException("Inscrição não encontrada"));
        
        if (!inscricao.getEvento().getId().equals(eventoId)) {
            throw new BusinessException("Inscrição não pertence a este evento");
        }
        
        return InscricaoResponseDTO.fromEntity(inscricao);
    }
    
    private void validarPermissaoLeitura(Evento evento, User currentUser) {
        boolean isOrganizador = evento.getUsuario().getId().equals(currentUser.getId());
        boolean isParticipante = inscricaoRepository.existsByEventoIdAndJogadorId(
            evento.getId(), 
            currentUser.getId()
        );
        
        if (!isOrganizador && !isParticipante) {
            throw new BusinessException("Você não tem permissão para acessar este evento");
        }
    }
}
```

## 📝 Repository

### InscricaoRepository

```java
package com.reidaquadra.repository;

import com.reidaquadra.entity.Inscricao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {
    
    List<Inscricao> findByEventoId(Long eventoId);
    
    boolean existsByEventoIdAndJogadorId(Long eventoId, Long jogadorId);
    
    List<Inscricao> findByJogadorId(Long jogadorId);
}
```

## 🧪 Testes

### InscricaoServiceTest

```java
@SpringBootTest
@Transactional
class InscricaoServiceTest {
    
    @Autowired
    private InscricaoService inscricaoService;
    
    @Test
    void deveAdicionarInscricaoComSucesso() {
        // Arrange
        InscricaoRequestDTO request = new InscricaoRequestDTO();
        request.setJogadorEmail("teste@email.com");
        
        // Act
        InscricaoResponseDTO response = inscricaoService.adicionarInscricao(1L, request, organizador);
        
        // Assert
        assertNotNull(response.getId());
        assertEquals("teste@email.com", response.getJogadorEmail());
    }
    
    @Test
    void naoDevePermitirInscricaoDuplicada() {
        // Test implementation
    }
    
    @Test
    void apenasOrganizadorPodeAdicionarJogadores() {
        // Test implementation
    }
}
```

## ✅ Checklist de Implementação

- [ ] Criar DTOs (InscricaoRequestDTO e InscricaoResponseDTO)
- [ ] Criar InscricaoService com métodos
- [ ] Criar InscricaoController com endpoints
- [ ] Adicionar métodos no InscricaoRepository
- [ ] Adicionar campo dataInscricao na entidade Inscricao (se não existir)
- [ ] Implementar validações de segurança
- [ ] Implementar validações de negócio
- [ ] Adicionar testes unitários
- [ ] Adicionar testes de integração
- [ ] Documentar no Swagger
- [ ] Testar com Postman/Insomnia
- [ ] Atualizar documentação da API

## 🚀 Após Implementação

1. Iniciar o backend
2. Verificar se os endpoints aparecem no Swagger: `http://localhost:8090/swagger-ui.html`
3. No frontend, executar: `npm run generate-api`
4. No frontend, alterar em `src/app/config/api.config.ts`:
   ```typescript
   USE_MOCK_INSCRICOES: false
   ```
5. Testar o fluxo completo no frontend

## 📞 Suporte

Se tiver dúvidas sobre a implementação, consulte:
- `INSCRICOES_API_REQUIREMENTS.md` - Requisitos detalhados
- Modelo de entidade `Inscricao` existente
- Outros controllers como referência (EventoController)
