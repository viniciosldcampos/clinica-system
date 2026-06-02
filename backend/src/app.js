const express = require('express');
const cors = require('cors');
require('express-async-errors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const env = require('./config/env');

const app = express();

// Middlewares globais
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      env.FRONTEND_URL,
      /https:\/\/clinica-system-.*\.vercel\.app$/,
    ]

    if (!origin) return callback(null, true) // permite Postman, Render health check, etc

    const isAllowed = allowed.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    )

    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error(`CORS bloqueado para: ${origin}`))
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições em desenvolvimento
if (env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas da API
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada',
    path: req.path,
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

module.exports = app;