const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const env = require('../config/env');

const authMiddleware = (req, res, next) => {
  // Pegar o token do header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Token não fornecido', 401);
  }

  // Formato esperado: "Bearer token"
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    throw new AppError('Formato de token inválido', 401);
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    throw new AppError('Token mal formatado', 401);
  }

  try {
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Adicionar dados do usuário na requisição
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    // O errorHandler vai tratar os erros de JWT
    throw error;
  }
};

module.exports = authMiddleware;