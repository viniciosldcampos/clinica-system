const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/UserRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const env = require('../config/env');
const { validateEmail, validatePassword } = require('../utils/validators');

class AuthService {
  async login(email, password) {
    if (!validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    if (!password) {
      throw new AppError('Senha é obrigatória', 400);
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    if (user.role === 'PATIENT') {
      throw new AppError('Pacientes não podem fazer login. Entre em contato com a clínica', 401);
    }

    if (!user.isActive) {
      throw new AppError('Usuário inativo. Entre em contato com o administrador', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      }
    );

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    if (user.role === 'DOCTOR' && user.doctor) {
      userData.doctor = {
        id: user.doctor.id,
        name: user.doctor.name,
        crm: user.doctor.crm,
        specialty: user.doctor.specialty,
      };
    }

    return {
      token,
      user: userData,
    };
  }

  async registerDoctor(data) {
    const { email, password, name, crm, specialty, phone } = data;

    if (!validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    if (!validatePassword(password)) {
      throw new AppError('Senha deve ter no mínimo 6 caracteres', 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    const existingDoctor = await doctorRepository.findByCRM(crm);
    if (existingDoctor) {
      throw new AppError('CRM já cadastrado', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      email,
      passwordHash,
      role: 'DOCTOR',
    });

    const doctor = await doctorRepository.create({
      userId: user.id,
      name,
      crm,
      specialty,
      phone,
      isActive: true,
    });

    return doctor;
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!validatePassword(newPassword)) {
      throw new AppError('Nova senha deve ter no mínimo 6 caracteres', 400);
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError('Senha atual incorreta', 401);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token expirado', 401);
      }
      throw new AppError('Token inválido', 401);
    }
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const { passwordHash, ...userData } = user;

    return userData;
  }
}

module.exports = new AuthService();