# 🏥 Sistema de Agendamento de Consultas

Sistema completo para gerenciamento de agendamentos de consultas médicas.

## 📋 Descrição

Sistema web para controle de agendamentos de consultas em clínicas, permitindo cadastro de pacientes, médicos, agendamento de consultas, controle de disponibilidade e notificações automáticas.

## 🚀 Tecnologias

### Frontend
- React
- HTML5
- CSS3
- JavaScript (ES6+)
- Axios

### Backend
- Node.js
- Express
- JWT (Autenticação)
- Bcrypt (Criptografia)

### Banco de Dados
- PostgreSQL
- Prisma ORM

### Notificações
- Nodemailer (Email)
- Twilio (SMS e WhatsApp)

## 📁 Estrutura do Projeto
clinica-system/  
├── frontend/          # Interface do usuário  
├── backend/           # API REST  
├── database/          # Scripts e migrations  
├── docs/              # Documentação  
└── README.md  

## ⚙️ Instalação

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuração

1. Clone o repositório
```bash
git clone https://github.com/viniciosldcampos/clinica-system.git
cd clinica-system
```

2. Configure o banco de dados PostgreSQL

3. Configure as variáveis de ambiente (.env)

## 📌 Funcionalidades

### Pacientes
- ✅ Cadastro (via admin)
- ✅ Login
- ✅ Agendamento de consultas
- ✅ Visualização de histórico
- ✅ Cancelamento/Reagendamento

### Médicos
- ✅ Login
- ✅ Visualização de agenda
- ✅ Definir indisponibilidade
- ✅ Histórico de atendimentos

### Administrador
- ✅ Cadastro de pacientes
- ✅ Cadastro de médicos
- ✅ Gerenciamento de consultas
- ✅ Relatórios

### Sistema
- ✅ Notificações por Email, SMS e WhatsApp
- ✅ Controle de horários disponíveis
- ✅ Validação de conflitos

## 📊 Regras de Negócio

- Horário de funcionamento: 8h às 18h (Segunda a Sábado)
- Agendamento com 7 dias de antecedência mínima
- Cancelamento com 2 dias de antecedência
- Paciente não pode ter 2 consultas simultâneas
- Notificação 1 dia antes da consulta

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT
- Variáveis sensíveis em .env
- Validação de inputs
- Proteção contra SQL Injection

## 📝 Status de Consultas

- `AGENDADA` - Consulta marcada
- `CONFIRMADA` - Paciente confirmou presença
- `REALIZADA` - Consulta finalizada
- `CANCELADA` - Cancelada pelo paciente/médico
- `FALTOU` - Paciente não compareceu

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor: Vinicios.