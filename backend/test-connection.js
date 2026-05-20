require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
    
    // Contar usuários (deve ser 0)
    const userCount = await prisma.user.count();
    console.log(`📊 Total de usuários no banco: ${userCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
    process.exit(1);
  }
}

testConnection();