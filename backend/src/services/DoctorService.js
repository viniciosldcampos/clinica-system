const AppError = require('../utils/AppError');
const doctorRepository = require('../repositories/DoctorRepository');
const userRepository = require('../repositories/UserRepository');
const authService = require('./AuthService');
const { validateCRM, validatePhone, validateEmail } = require('../utils/validators');

class DoctorService {
  /**
    Criar novo médico (apenas ADMIN)
    @param {Object} data - Dados do médico
    @returns {Promise<Object>} - Médico criado
   */
  async create(data) {
    const { email, password, name, crm, specialty, phone } = data;

    // Validações
    if (!name || name.trim().length < 3) {
      throw new AppError('Nome deve ter no mínimo 3 caracteres', 400);
    }

    if (!validateEmail(email)) {
      throw new AppError('Email inválido', 400);
    }

    if (!validateCRM(crm)) {
      throw new AppError('CRM inválido', 400);
    }

    if (!specialty || specialty.trim().length < 3) {
      throw new AppError('Especialidade deve ter no mínimo 3 caracteres', 400);
    }

    if (!validatePhone(phone)) {
      throw new AppError('Telefone inválido', 400);
    }

    if (!password || password.length < 6) {
      throw new AppError('Senha deve ter no mínimo 6 caracteres', 400);
    }

    // Usar o AuthService para criar usuário + médico
    const doctor = await authService.registerDoctor({
      email,
      password,
      name: name.trim(),
      crm: crm.replace(/[^\d]/g, ''), // Remove caracteres especiais
      specialty: specialty.trim(),
      phone: phone.replace(/[^\d]/g, ''),
    });

    return doctor;
  }

  /**
    Buscar médico por ID
    @param {string} id - ID do médico
    @returns {Promise<Object>} - Médico encontrado
   */
  async findById(id) {
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    return doctor;
  }

  /**
    Buscar médico por user ID
    @param {string} userId - ID do usuário
    @returns {Promise<Object>} - Médico encontrado
   */
  async findByUserId(userId) {
    const doctor = await doctorRepository.findByUserId(userId);

    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    return doctor;
  }

  /**
    Listar todos os médicos
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de médicos
   */
  async findAll(filters = {}) {
    return await doctorRepository.findAll(filters);
  }

  /**
    Listar médicos ativos
    @returns {Promise<Array>} - Lista de médicos ativos
   */
  async findActive() {
    return await doctorRepository.findActive();
  }

  /**
    Listar especialidades únicas
    @returns {Promise<Array>} - Lista de especialidades
   */
  async findUniqueSpecialties() {
    return await doctorRepository.findUniqueSpecialties();
  }

  /**
    Buscar médicos por especialidade
    @param {string} specialty - Especialidade
    @returns {Promise<Array>} - Lista de médicos
   */
  async findBySpecialty(specialty) {
    if (!specialty || specialty.trim().length === 0) {
      throw new AppError('Especialidade é obrigatória', 400);
    }

    return await doctorRepository.findBySpecialty(specialty.trim());
  }

  /**
    Atualizar médico
    @param {string} id - ID do médico
    @param {Object} data - Dados a atualizar
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Médico atualizado
   */
  async update(id, data, requestUserId, requestUserRole) {
    // Buscar médico
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    // Verificar permissão: ADMIN pode editar qualquer um, DOCTOR só pode editar a si mesmo
    if (requestUserRole === 'DOCTOR' && doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para editar este médico', 403);
    }

    // Dados que podem ser atualizados
    const updateData = {};

    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new AppError('Nome deve ter no mínimo 3 caracteres', 400);
      }
      updateData.name = data.name.trim();
    }

    if (data.specialty) {
      if (data.specialty.trim().length < 3) {
        throw new AppError('Especialidade deve ter no mínimo 3 caracteres', 400);
      }
      updateData.specialty = data.specialty.trim();
    }

    if (data.phone) {
      if (!validatePhone(data.phone)) {
        throw new AppError('Telefone inválido', 400);
      }
      updateData.phone = data.phone.replace(/[^\d]/g, '');
    }

    // CRM não pode ser alterado
    if (data.crm) {
      throw new AppError('CRM não pode ser alterado', 400);
    }

    // Atualizar
    const updatedDoctor = await doctorRepository.update(id, updateData);

    return updatedDoctor;
  }

  /**
    Atualizar email do médico
    @param {string} id - ID do médico
    @param {string} newEmail - Novo email
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<void>}
   */
  async updateEmail(id, newEmail, requestUserId, requestUserRole) {
    // Buscar médico
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    // Verificar permissão
    if (requestUserRole === 'DOCTOR' && doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para editar este médico', 403);
    }

    // Validar email
    if (!validateEmail(newEmail)) {
      throw new AppError('Email inválido', 400);
    }

    // Verificar se email já existe
    const existingUser = await userRepository.findByEmail(newEmail);
    if (existingUser && existingUser.id !== doctor.userId) {
      throw new AppError('Email já está em uso', 400);
    }

    // Atualizar email do usuário
    await userRepository.update(doctor.userId, { email: newEmail });
  }

  /**
    Deletar médico (apenas ADMIN)
    @param {string} id - ID do médico
    @returns {Promise<void>}
   */
  async delete(id) {
    // Verificar se médico existe
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    // Verificar se tem consultas futuras
    const upcomingAppointments = doctor.appointments?.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && ['AGENDADA', 'CONFIRMADA'].includes(appointment.status);
    });

    if (upcomingAppointments && upcomingAppointments.length > 0) {
      throw new AppError('Não é possível deletar médico com consultas futuras. Cancele as consultas primeiro.', 400);
    }

    // Deletar médico (cascade deleta o usuário e indisponibilidades)
    await userRepository.delete(doctor.userId);
  }

  /**
    Ativar/Desativar médico (apenas ADMIN)
    @param {string} id - ID do médico
    @param {boolean} isActive - Status ativo
    @returns {Promise<Object>} - Médico atualizado
   */
  async toggleActive(id, isActive) {
    // Verificar se médico existe
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    // Se está desativando, verificar consultas futuras
    if (!isActive) {
      const upcomingAppointments = doctor.appointments?.filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointmentDate >= today && ['AGENDADA', 'CONFIRMADA'].includes(appointment.status);
      });

      if (upcomingAppointments && upcomingAppointments.length > 0) {
        throw new AppError('Não é possível desativar médico com consultas futuras. Cancele as consultas primeiro.', 400);
      }
    }

    // Atualizar status do usuário
    await userRepository.toggleActive(doctor.userId, isActive);

    // Retornar médico atualizado
    return await doctorRepository.findById(id);
  }

  /**
    Contar médicos
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de médicos
   */
  async count(filters = {}) {
    return await doctorRepository.count(filters);
  }

  /**
    Buscar agenda do médico
    @param {string} id - ID do médico
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Médico com consultas e indisponibilidades
   */
  async getSchedule(id, requestUserId, requestUserRole) {
    // Buscar médico com consultas e indisponibilidades
    const doctor = await doctorRepository.findById(id);

    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    // Verificar permissão: DOCTOR só pode ver sua própria agenda
    if (requestUserRole === 'DOCTOR' && doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para ver a agenda deste médico', 403);
    }

    return {
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
      },
      appointments: doctor.appointments || [],
      unavailability: doctor.doctorUnavailability || [],
    };
  }
}

module.exports = new DoctorService();