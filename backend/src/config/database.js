const { PrismaClient } = require('@prisma/client');

// Criar instância única do Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Tratamento de erros de conexão
prisma.$connect()
  .then(() => {
    console.log('✅ Conectado ao banco de dados PostgreSQL');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  });

// Desconectar quando a aplicação fechar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;