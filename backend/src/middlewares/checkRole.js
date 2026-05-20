const AppError = require('../utils/AppError');

/**
 * Middleware para verificar se o usuário tem a role necessária
 * @param {Array} allowedRoles - Array de roles permitidas ['ADMIN', 'DOCTOR']
 * @returns {Function} Middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // Verifica se o usuário está autenticado (deve usar authMiddleware antes)
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    // Verifica se a role do usuário está na lista de roles permitidas
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('Acesso negado. Você não tem permissão para acessar este recurso', 403);
    }

    return next();
  };
};

module.exports = checkRole;