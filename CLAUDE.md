# Ponto Fácil — CLAUDE.md

## Regras Gerais
- **NUNCA fazer commits automáticos.** Sempre aguardar instrução explícita do usuário.
- Usar português brasileiro com acentuação correta em todos os textos de interface.
- Seguir estritamente as convenções de código definidas neste documento.
- Fechar modal ao clicar fora (backdrop) ou pressionar ESC.
- Tratar erros e enviar mensagem clara ao usuário — evitar simplesmente "Erro 500".

## Stack Tecnológica

### Frontend
- React 19 com TypeScript 5
- Vite 6 como build tool
- Tailwind CSS 3 para estilização
- React Router DOM 7 para navegação

### Backend
- Laravel 11+ com PHP 8.4+
- MySQL 8
- Laravel Sanctum para autenticação API
- Arquitetura MVC, REST JSON API

## Estrutura do Projeto
```
/
├── backend/       ← Laravel API
├── pages/         ← Páginas React
├── components/    ← Componentes compartilhados
├── services/      ← Serviços de API
├── hooks/         ← Hooks customizados
├── utils/         ← Funções utilitárias e dados iniciais
├── types/         ← Interfaces TypeScript
├── src/           ← Entrada do React (main.tsx, App.tsx, index.css)
└── docker/        ← Configurações Docker
```

## Comandos Make
```bash
make up           # Iniciar ambiente de desenvolvimento
make up-prod      # Iniciar ambiente de produção
make down         # Parar containers
make migrate      # Executar migrações
make seed         # Executar seeders
make fresh        # Migração fresh com seed
make deploy       # Deploy em produção
make send         # Commit e push (pede mensagem, executa lint)
make db           # Abrir shell do banco
make thinker      # Abrir Laravel Tinker
make shell        # Abrir shell do container app
make install      # Instalar dependências backend e frontend
```

## Convenções de Código

### React
- Apenas componentes funcionais
- Props tipadas com interfaces TypeScript
- Serviços isolados em /services — sem fetch direto nos componentes
- Hooks customizados em /hooks

### Laravel
- Controllers retornam JSON consistente com status codes adequados
- Usar FormRequest para validação
- Usar API Resources para transformação de resposta
- Lógica de negócio em Services
- Sem lógica pesada nos Controllers

## Design System
- Cor primária: #1a7a4a (verde)
- Fundo: gradiente dark `from-slate-900 via-slate-800 to-emerald-900`
- Cards: Glass Design com `bg-white/10 backdrop-blur-md border border-white/20`
- Transições: 300ms em todos os elementos interativos
- Design responsivo mobile-first (a partir de 360px)

## Banco de Dados
- Toda tabela deve ter: `id()`, `timestamps()`, `softDeletes()`
- Relacionamentos com `foreignId().constrained().onDelete('cascade')`
- Seeders devem usar `updateOrCreate()` para idempotência

## Usuários de Demonstração
- Funcionário: joao@pontofacil.com / 123456
- Administrador: admin@pontofacil.com / 123456
- Administrador padrão BD: admin@admin.com / 123456
