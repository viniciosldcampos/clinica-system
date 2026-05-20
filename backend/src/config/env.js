require('dotenv').config();

const env = {
  // Servidor
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3333,

  // Banco de Dados
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,

  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3333',

  // Horário da Clínica
  CLINIC_OPEN_TIME: process.env.CLINIC_OPEN_TIME || '08:00',
  CLINIC_CLOSE_TIME: process.env.CLINIC_CLOSE_TIME || '18:00',
  CLINIC_WORK_DAYS: process.env.CLINIC_WORK_DAYS
    ? process.env.CLINIC_WORK_DAYS.split(',').map(Number)
    : [1, 2, 3, 4, 5, 6], // Segunda a Sábado

  // Regras de Agendamento
  MIN_DAYS_ADVANCE: parseInt(process.env.MIN_DAYS_ADVANCE) || 7,
  MIN_DAYS_CANCEL: parseInt(process.env.MIN_DAYS_CANCEL) || 2,
  DEFAULT_APPOINTMENT_DURATION: parseInt(process.env.DEFAULT_APPOINTMENT_DURATION) || 30,
};

// Validar variáveis obrigatórias
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

requiredEnvVars.forEach((envVar) => {
  if (!env[envVar]) {
    console.error(`❌ Variável de ambiente obrigatória não encontrada: ${envVar}`);
    process.exit(1);
  }
});

module.exports = env;