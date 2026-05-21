const AppError = require('../utils/AppError');
const patientRepository = require('../repositories/PatientRepository');
const userRepository = require('../repositories/UserRepository');
const authService = require('./AuthService');
const { validateCPF, validatePhone, validateEmail, validateBirthDate, formatCPF, formatPhone } = require('../utils/validators');

class PatientService {
  /**
   * Criar novo paciente (apenas ADMIN)
   * @param {Object} data - Dados do paciente
   * @returns {Promise<Object>} - Paciente criado
   */
  async create(data) {
    const { email, password, name, cpf, phone, birthDate, address } = data;

    // Validações
    if (!name || name.trim().length < 3) {
      throw new AppError('Nome deve ter no mínimo 3 caracteres', 400);
    }

    if (!validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    if (!validateCPF(cpf)) {
      throw new AppError('CPF inválido', 400);
    }

    if (!validatePhone(phone)) {
      throw new AppError('Telefone inválido', 400);
    }

    if (!validateBirthDate(birthDate)) {
      throw new AppError('Data de nascimento inválida', 400);
    }

    if (!password || password.length < 6) {
      throw new AppError('Senha deve ter no mínimo 6 caracteres', 400);
    }

    // Usar o AuthService para criar usuário + paciente
    const patient = await authService.registerPatient({
      email,
      password,
      name: name.trim(),
      cpf,
      phone: formatPhone(phone),
      birthDate,
      address: address?.trim() || null,
    });

    return patient;
  }

  /**
   * Buscar paciente por ID
   * @param {string} id - ID do paciente
   * @returns {Promise<Object>} - Paciente encontrado
   */
  async findById(id) {
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    return patient;
  }

  /**
   * Buscar paciente por user ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Paciente encontrado
   */
  async findByUserId(userId) {
    const patient = await patientRepository.findByUserId(userId);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    return patient;
  }

  /**
   * Listar todos os pacientes
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Lista de pacientes
   */
  async findAll(filters = {}) {
    return await patientRepository.findAll(filters);
  }

  /**
   * Buscar pacientes com consultas futuras
   * @returns {Promise<Array>} - Lista de pacientes
   */
  async findWithUpcomingAppointments() {
    return await patientRepository.findWithUpcomingAppointments();
  }

  /**
   * Atualizar paciente
   * @param {string} id - ID do paciente
   * @param {Object} data - Dados a atualizar
   * @param {string} requestUserId - ID do usuário que faz a requisição
   * @param {string} requestUserRole - Role do usuário que faz a requisição
   * @returns {Promise<Object>} - Paciente atualizado
   */
  async update(id, data, requestUserId, requestUserRole) {
    // Buscar paciente
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Verificar permissão: ADMIN pode editar qualquer um, PATIENT só pode editar a si mesmo
    if (requestUserRole === 'PATIENT' && patient.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para editar este paciente', 403);
    }

    // Dados que podem ser atualizados
    const updateData = {};

    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new AppError('Nome deve ter no mínimo 3 caracteres', 400);
      }
      updateData.name = data.name.trim();
    }

    if (data.phone) {
      if (!validatePhone(data.phone)) {
        throw new AppError('Telefone inválido', 400);
      }
      updateData.phone = formatPhone(data.phone);
    }

    if (data.birthDate) {
      if (!validateBirthDate(data.birthDate)) {
        throw new AppError('Data de nascimento inválida', 400);
      }
      updateData.birthDate = new Date(data.birthDate);
    }

    if (data.address !== undefined) {
      updateData.address = data.address?.trim() || null;
    }

    // CPF não pode ser alterado
    if (data.cpf) {
      throw new AppError('CPF não pode ser alterado', 400);
    }

    // Atualizar
    const updatedPatient = await patientRepository.update(id, updateData);

    return updatedPatient;
  }

  /**
   * Atualizar email do paciente
   * @param {string} id - ID do paciente
   * @param {string} newEmail - Novo email
   * @param {string} requestUserId - ID do usuário que faz a requisição
   * @param {string} requestUserRole - Role do usuário que faz a requisição
   * @returns {Promise<void>}
   */
  async updateEmail(id, newEmail, requestUserId, requestUserRole) {
    // Buscar paciente
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Verificar permissão
    if (requestUserRole === 'PATIENT' && patient.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para editar este paciente', 403);
    }

    // Validar email
    if (!validateEmail(newEmail)) {
      throw new AppError('Email inválido', 400);
    }

    // Verificar se email já existe
    const existingUser = await userRepository.findByEmail(newEmail);
    if (existingUser && existingUser.id !== patient.userId) {
      throw new AppError('Email já está em uso', 400);
    }

    // Atualizar email do usuário
    await userRepository.update(patient.userId, { email: newEmail });
  }

  /**
   * Deletar paciente (apenas ADMIN)
   * @param {string} id - ID do paciente
   * @returns {Promise<void>}
   */
  async delete(id) {
    // Verificar se paciente existe
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Verificar se tem consultas futuras
    const upcomingAppointments = patient.appointments?.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && ['AGENDADA', 'CONFIRMADA'].includes(appointment.status);
    });

    if (upcomingAppointments && upcomingAppointments.length > 0) {
      throw new AppError('Não é possível deletar paciente com consultas futuras. Cancele as consultas primeiro.', 400);
    }

    // Deletar paciente (cascade deleta o usuário)
    await userRepository.delete(patient.userId);
  }

  /**
   * Ativar/Desativar paciente (apenas ADMIN)
   * @param {string} id - ID do paciente
   * @param {boolean} isActive - Status ativo
   * @returns {Promise<Object>} - Paciente atualizado
   */
  async toggleActive(id, isActive) {
    // Verificar se paciente existe
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Atualizar status do usuário
    await userRepository.toggleActive(patient.userId, isActive);

    // Retornar paciente atualizado
    return await patientRepository.findById(id);
  }

  /**
   * Contar pacientes
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<number>} - Quantidade de pacientes
   */
  async count(filters = {}) {
    return await patientRepository.count(filters);
  }

  /**
   * Buscar histórico de consultas do paciente
   * @param {string} id - ID do paciente
   * @param {string} requestUserId - ID do usuário que faz a requisição
   * @param {string} requestUserRole - Role do usuário que faz a requisição
   * @returns {Promise<Array>} - Lista de consultas
   */
  async getAppointmentHistory(id, requestUserId, requestUserRole) {
    // Buscar paciente com consultas
    const patient = await patientRepository.findById(id);

    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Verificar permissão: PATIENT só pode ver suas próprias consultas
    if (requestUserRole === 'PATIENT' && patient.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para ver o histórico deste paciente', 403);
    }

    return patient.appointments || [];
  }
}

module.exports = new PatientService();