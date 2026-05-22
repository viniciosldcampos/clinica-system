const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado com sucesso!');
  console.log(`📡 Rodando em: http://localhost:${PORT}`);
  console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
  console.log(`📊 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Endpoints disponíveis:');
  console.log(`  - POST   /api/auth/login`);
  console.log(`  - GET    /api/patients`);
  console.log(`  - GET    /api/doctors/active`);
  console.log(`  - POST   /api/appointments`);
  console.log('');
  console.log('Pressione CTRL+C para parar o servidor');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT recebido, encerrando servidor...');
  process.exit(0);
});