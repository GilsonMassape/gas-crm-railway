# Backend do CRM de Gás - Dr. Gilson

Backend completo com Node.js, Express e PostgreSQL para o sistema CRM de entrega de gás.

## Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **bcryptjs** - Hash de senhas

## Funcionalidades

- ✅ Autenticação completa (login, logout, verificação)
- ✅ CRUD de clientes
- ✅ CRUD de usuários (admin)
- ✅ Registro de compras
- ✅ Estatísticas em tempo real
- ✅ Alertas de ciclo de compra
- ✅ API REST completa

## Instalação Local

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

## Executar

```bash
npm start
```

## Deploy no Railway

1. Conecte o repositório no Railway
2. Railway detecta automaticamente o Node.js
3. Railway provisiona PostgreSQL automaticamente
4. Configure as variáveis de ambiente
5. Deploy automático!

## Endpoints da API

### Autenticação
- `POST /api/setup/criar-admin` - Criar administrador inicial
- `POST /api/auth/login` - Login
- `GET /api/auth/verificar` - Verificar autenticação
- `POST /api/auth/logout` - Logout

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente
- `POST /api/clientes/:id/compra` - Registrar compra

### Usuários
- `GET /api/usuarios` - Listar usuários (admin)
- `POST /api/usuarios` - Criar usuário (admin)
- `DELETE /api/usuarios/:id` - Deletar usuário (admin)

### Estatísticas
- `GET /api/estatisticas` - Buscar estatísticas

## Segurança

- Senhas com hash bcrypt
- Autenticação JWT
- Cookies HttpOnly
- CORS configurado
- SQL injection protegido (prepared statements)

