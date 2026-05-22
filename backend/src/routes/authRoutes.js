const express = require('express');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

/**
  POST /auth/login
  Login (público)
 */
router.post('/login', authController.login);

/**
  PUT /auth/change-password
  Alterar senha (requer autenticação)
 */
router.put('/change-password', authMiddleware, authController.changePassword);

/**
  GET /auth/profile
  Obter perfil do usuário logado (requer autenticação)
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
  GET /auth/verify
  Verificar se token é válido (requer autenticação)
 */
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;