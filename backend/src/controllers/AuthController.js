const authService = require('../services/AuthService');

class AuthController {
  /**
   Login
   POST /auth/login
   Body: { email, password }
   */
  async login(req, res) {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso',
      data: result,
    });
  }

  /**
   Alterar senha
   PUT /auth/change-password
   Body: { currentPassword, newPassword }
   Requer autenticação
   */
  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    await authService.changePassword(userId, currentPassword, newPassword);

    return res.status(200).json({
      status: 'success',
      message: 'Senha alterada com sucesso',
    });
  }

  /**
   Obter perfil do usuário logado
   GET /auth/profile
   Requer autenticação
   */
  async getProfile(req, res) {
    const userId = req.user.id;

    const profile = await authService.getProfile(userId);

    return res.status(200).json({
      status: 'success',
      data: profile,
    });
  }

  /**
   Verificar token
   GET /auth/verify
   Requer autenticação
   */
  async verifyToken(req, res) {
    // Se chegou aqui, o token é válido (passou pelo authMiddleware)
    return res.status(200).json({
      status: 'success',
      message: 'Token válido',
      data: {
        user: req.user,
      },
    });
  }
}

module.exports = new AuthController();