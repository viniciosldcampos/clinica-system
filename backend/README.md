# 🏥 Backend - Sistema de Agendamento de Consultas

API REST para gerenciamento de agendamentos de consultas médicas.

## 🚀 Tecnologias

- **Node.js** 18+
- **Express** - Framework web
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **Nodemailer** - Envio de emails
- **Twilio** - SMS e WhatsApp

## 📋 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior
- npm ou yarn

## ⚙️ Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` e configure:

```env
DATABASE_URL="postgresql://clinica_user:senha_forte_123@localhost:5432/clinica_db?schema=public"
JWT_SECRET=seu_secret_muito_seguro_aqui
```

### 3. Executar migrations

```bash
npm run migrate
```

### 4. Popular banco com dados iniciais (opcional)

```bash
npm run seed
```

### 5. Iniciar servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará rodando em: **http://localhost:3333**

## 📊 Scripts Disponíveis

```bash
npm run dev              # Inicia em modo desenvolvimento
npm start                # Inicia em modo produção
npm run migrate          # Executa migrations
npm run seed             # Popula banco com dados iniciais
npm run prisma:studio    # Interface visual do banco
npm run prisma:generate  # Gera Prisma Client
```

## 🔐 Credenciais Padrão (após seed)

### Admin
- Email: `admin@clinica.com`
- Senha: `senha123`

### Médicos
- Email: `dr.silva@clinica.com` | Senha: `senha123`
- Email: `dra.santos@clinica.com` | Senha: `senha123`

### Pacientes
- Email: `carlos@email.com` | Senha: `senha123`
- Email: `ana@email.com` | Senha: `senha123`
- Email: `pedro@email.com` | Senha: `senha123`

## 📡 Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário
- `PUT /api/auth/change-password` - Alterar senha

### Pacientes (ADMIN)
- `GET /api/patients` - Listar
- `POST /api/patients` - Criar
- `PUT /api/patients/:id` - Atualizar
- `DELETE /api/patients/:id` - Deletar

### Médicos
- `GET /api/doctors/active` - Listar ativos (público)
- `GET /api/doctors/specialties` - Especialidades (público)
- `POST /api/doctors` - Criar (ADMIN)

### Consultas
- `POST /api/appointments` - Agendar (PATIENT)
- `GET /api/appointments/my` - Minhas consultas
- `PATCH /api/appointments/:id/cancel` - Cancelar
- `PATCH /api/appointments/:id/status` - Atualizar status (DOCTOR/ADMIN)

### Indisponibilidades
- `GET /api/doctor-unavailability/doctor/:id/future` - Ver futuras (público)
- `POST /api/doctor-unavailability` - Criar (DOCTOR/ADMIN)

## 🏗️ Estrutura do Projeto
backend/
├── prisma/
│   ├── migrations/        # Migrations do banco
│   └── schema.prisma      # Schema do Prisma
├── src/
│   ├── config/            # Configurações
│   │   ├── database.js    # Prisma Client
│   │   └── env.js         # Variáveis de ambiente
│   ├── controllers/       # Controllers (camada HTTP)
│   ├── services/          # Services (regras de negócio)
│   ├── repositories/      # Repositories (acesso ao banco)
│   ├── routes/            # Rotas da API
│   ├── middlewares/       # Middlewares
│   ├── utils/             # Utilitários
│   ├── database/          # Seeds
│   ├── app.js             # Configuração do Express
│   └── server.js          # Inicialização do servidor
├── .env.example           # Exemplo de variáveis
├── .gitignore
├── package.json
└── README.md

## 🔒 Segurança

- Senhas criptografadas com **bcrypt**
- Autenticação via **JWT**
- Validação de dados com **Zod**
- CORS configurado
- Variáveis sensíveis em `.env`

## 📝 Regras de Negócio

- Agendamento com **7 dias** de antecedência mínima
- Cancelamento com **2 dias** de antecedência mínima
- Horário de funcionamento: **8h às 18h** (Segunda a Sábado)
- Duração padrão da consulta: **30 minutos**
- Um paciente não pode ter 2 consultas no mesmo horário
- Um médico não pode ter 2 consultas no mesmo horário

## 🧪 Testar a API

Use **Thunder Client**, **Postman** ou **cURL**:

```bash
# Health Check
curl http://localhost:3333/health

# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"senha123"}'

# Listar médicos ativos
curl http://localhost:3333/api/doctors/active
```

## 🐛 Troubleshooting

### Erro de conexão com banco
❌ Erro ao conectar ao banco de dados
**Solução:** Verifique se o PostgreSQL está rodando e as credenciais no `.env` estão corretas.

### Porta 3333 em uso
Error: listen EADDRINUSE: address already in use :::3333
**Solução:** Altere a porta no `.env` ou mate o processo que está usando a porta 3333.

### Erro de JWT
Token inválido
**Solução:** Verifique se o `JWT_SECRET` no `.env` está configurado.

## 📚 Documentação Adicional

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 👨‍💻 Desenvolvedor

**Vinicios Leite de Campos**

## 👨‍💻 Autor: Vinicios.