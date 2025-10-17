# Rei da Quadra

Uma aplicação Angular para gerenciamento de competições de futebol com suporte a múltiplos idiomas.

## 🚀 Funcionalidades

- **Internacionalização**: Suporte a Português, Inglês e Espanhol
- **Interface Moderna**: Desenvolvida com Angular Material
- **Responsiva**: Adaptada para dispositivos móveis e desktop

## 🛠️ Tecnologias Utilizadas

- Angular 19
- Angular Material
- TypeScript
- CSS3
- Material Icons

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd rei-da-quadra-fe
```

2. Instale as dependências:
```bash
npm install
```

3. Execute a aplicação:
```bash
ng serve
```

4. Acesse `http://localhost:4200` no seu navegador

## 🌍 Idiomas Suportados

- **Português (pt)**: Idioma padrão
- **English (en)**: Inglês
- **Español (es)**: Espanhol

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── services/
│   │   └── language.service.ts   # Gerenciamento de idiomas
│   ├── app.component.ts          # Componente principal
│   ├── app.component.html        # Template principal
│   └── app.component.css         # Estilos do componente
├── styles.css                    # Estilos globais
└── index.html                    # Página principal
```

## 🔧 Scripts Disponíveis

- `ng serve`: Executa a aplicação em modo de desenvolvimento
- `ng build`: Gera o build de produção
- `ng test`: Executa os testes unitários
- `ng lint`: Executa o linter

## 📱 Responsividade

A aplicação é totalmente responsiva e se adapta a diferentes tamanhos de tela:

- **Desktop**: Layout em grid com duas colunas
- **Tablet**: Layout adaptado com espaçamentos otimizados
- **Mobile**: Layout em coluna única com elementos empilhados

## 🎯 Próximas Funcionalidades

- Sistema de criação de competições
- Gerenciamento de jogadores
- Rodízio automático de times
- Estatísticas de jogos
- Sistema de pontuação

## 📄 Licença

Este projeto está sob a licença MIT.
