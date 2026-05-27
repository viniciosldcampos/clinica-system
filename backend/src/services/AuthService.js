const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/UserRepository');
const patientRepository = require('../repositories/PatientRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const env = require('../config/env');
const { validateEmail, validatePassword, validateCPF, formatCPF } = require('../utils/validators');

class AuthService {
  /**
   * Realizar login
    @param {string} email - Email do usuário
    @param {string} password - Senha do usuário
    @returns {Promise<Object>} - Token e dados do usuário
   */
  async login(email, password) {
    // Validar email
    if (!validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    // Validar senha
    if (!password) {
      throw new AppError('Senha é obrigatória', 400);
    }

    // Buscar usuário
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      throw new AppError('Usuário inativo. Entre em contato com o administrador', 401);
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Gerar token JWT
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

    // Montar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    // Adicionar dados específicos (paciente ou médico)
    if (user.role === 'PATIENT' && user.patient) {
      userData.patient = {
        id: user.patient.id,
        name: user.patient.name,
        cpf: user.patient.cpf,
        phone: user.patient.phone,
      };
    }

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

  /**
   * Registrar novo paciente (apenas ADMIN pode fazer isso via outro service)
    Este método é auxiliar para criar o usuário + paciente
    @param {Object} data - Dados do paciente
    @returns {Promise<Object>} - Paciente criado
   */
  async registerPatient(data) {
    const { email, password, name, cpf, phone, birthDate, address } = data;

    // Validações
    if (!validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    if (!validatePassword(password)) {
      throw new AppError('Senha deve ter no mínimo 6 caracteres', 400);
    }

    if (!validateCPF(cpf)) {
      throw new AppError('CPF inválido', 400);
    }

    // Verificar se email já existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Verificar se CPF já existe
    const formattedCPF = formatCPF(cpf);
    const existingPatient = await patientRepository.findByCPF(formattedCPF);
    if (existingPatient) {
      throw new AppError('CPF já cadastrado', 400);
    }

    // Criptografar senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await userRepository.create({
      email,
      passwordHash,
      role: 'PATIENT',
    });

    // Criar paciente
    const patient = await patientRepository.create({
      userId: user.id,
      name,
      cpf: formattedCPF,
      phone,
      birthDate: new Date(birthDate),
      address,
    });

    return patient;
  }

  /**
    Registrar novo médico (apenas ADMIN)
    @param {Object} data - Dados do médico
    @returns {Promise<Object>} - Médico criado
   */
  async registerDoctor(data) {
    const { email, password, name, crm, specialty, phone } = data;

    // Validações
    if (!validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    if (!validatePassword(password)) {
      throw new AppError('Senha deve ter no mínimo 6 caracteres', 400);
    }

    // Verificar se email já existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Verificar se CRM já existe
    const existingDoctor = await doctorRepository.findByCRM(crm);
    if (existingDoctor) {
      throw new AppError('CRM já cadastrado', 400);
    }

    // Criptografar senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await userRepository.create({
      email,
      passwordHash,
      role: 'DOCTOR',
    });

    // Criar médico
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

  /**
   * Alterar senha
    @param {string} userId - ID do usuário
    @param {string} currentPassword - Senha atual
    @param {string} newPassword - Nova senha
    @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Validar nova senha
    if (!validatePassword(newPassword)) {
      throw new AppError('Nova senha deve ter no mínimo 6 caracteres', 400);
    }

    // Buscar usuário
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar senha atual
    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError('Senha atual incorreta', 401);
    }

    // Criptografar nova senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }

  /**
   * Verificar token JWT
    @param {string} token - Token JWT
    @returns {Promise<Object>} - Dados do token decodificado
   */
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

  /**
   * Obter perfil do usuário logado
    @param {string} userId - ID do usuário
    @returns {Promise<Object>} - Dados do usuário
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Remover senha do retorno
    const { passwordHash, ...userData } = user;

    return userData;
  }
}

module.exports = new AuthService();