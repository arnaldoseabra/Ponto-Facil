# Ponto Fácil

Sistema de Registro de Ponto por Geolocalização GPS — 100% conforme CLT.

## Funcionalidades

- Registro de ponto (entrada, almoço, retorno, saída) com validação GPS
- Cálculo automático de horas trabalhadas e horas extras
- Alertas de conformidade CLT em tempo real
- Notificações automáticas via WhatsApp (Evolution API)
- Relatórios gerenciais com exportação PDF/Excel
- Rankings de horas extras, atrasos e faltas
- Central de convênios e benefícios
- Mural de aniversariantes

## Requisitos

- Docker e Docker Compose
- Node.js 22+ (para desenvolvimento local sem Docker)

## Início Rápido

```bash
cp .env.example .env
make up
make install
make fresh
```

Acesse: http://localhost:5173 (desenvolvimento) ou http://localhost (produção)

### Usuários de Demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Funcionário | joao@pontofacil.com | 123456 |
| Administrador | admin@pontofacil.com | 123456 |

## Comandos

```bash
make up          # Iniciar desenvolvimento
make down        # Parar containers
make migrate     # Executar migrações
make seed        # Popular banco com dados de demonstração
make fresh       # Reset do banco com seed
make deploy      # Deploy em produção
make send        # Commit, push e merge automático
make shell       # Shell do container PHP
make db          # Shell do MySQL
make thinker     # Laravel Tinker
```

## Stack

- **Frontend**: React 19 + TypeScript 5 + Vite + Tailwind CSS
- **Backend**: Laravel 11 + PHP 8.4 + MySQL 8 + Laravel Sanctum
- **Infra**: Docker + Nginx + Redis
