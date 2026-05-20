const AppError = require('../utils/AppError');
const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  // Log do erro no console (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erro capturado:', err);
  }

  // Erro operacional (esperado) - AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Erros do Prisma (banco de dados)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Violação de constraint único (CPF, email, CRM duplicado)
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'campo';
      return res.status(400).json({
        status: 'error',
        message: `${field} já está cadastrado`,
      });
    }

    // Registro não encontrado
    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Registro não encontrado',
      });
    }

    // Violação de chave estrangeira
    if (err.code === 'P2003') {
      return res.status(400).json({
        status: 'error',
        message: 'Referência inválida',
      });
    }
  }

  // Erros de validação do Prisma
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 'error',
      message: 'Dados inválidos fornecidos',
    });
  }

  // Erro de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido',
    });
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expirado',
    });
  }

  // Erro genérico (não esperado)
  console.error('❌ Erro não tratado:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

module.exports = errorHandler;