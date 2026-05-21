const AppError = require('../utils/AppError');
const doctorUnavailabilityRepository = require('../repositories/DoctorUnavailabilityRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const appointmentRepository = require('../repositories/AppointmentRepository');
const {
  validateDateFormat,
  validateTime,
  isWorkDay,
  isPastDate,
  formatDateToString,
  timeToMinutes,
} = require('../utils/dateHelpers');

class DoctorUnavailabilityService {
  /**
    Criar nova indisponibilidade (DOCTOR ou ADMIN)
    @param {Object} data - Dados da indisponibilidade
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Indisponibilidade criada
   */
  async create(data, requestUserId, requestUserRole) {
    const { doctorId, unavailableDate, startTime, endTime, reason } = data;

    // Validações básicas
    if (!doctorId) {
      throw new AppError('ID do médico é obrigatório', 400);
    }

    if (!unavailableDate) {
      throw new AppError('Data de indisponibilidade é obrigatória', 400);
    }

    if (!startTime) {
      throw new AppError('Horário inicial é obrigatório', 400);
    }

    if (!endTime) {
      throw new AppError('Horário final é obrigatório', 400);
    }

    // Validar formato de data e hora
    if (!validateDateFormat(unavailableDate)) {
      throw new AppError('Formato de data inválido. Use YYYY-MM-DD', 400);
    }

    if (!validateTime(startTime)) {
      throw new AppError('Formato de horário inicial inválido. Use HH:MM', 400);
    }

    if (!validateTime(endTime)) {
      throw new AppError('Formato de horário final inválido. Use HH:MM', 400);
    }

    // Verificar se médico existe
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    // Verificar permissão: DOCTOR só pode criar para si mesmo
    if (requestUserRole === 'DOCTOR' && doctor.userId !== requestUserId) {
      throw new AppError('Você só pode criar indisponibilidade para si mesmo', 403);
    }

    // Validar data (não pode ser passada)
    const date = new Date(unavailableDate);
    if (isPastDate(date)) {
      throw new AppError('Não é possível criar indisponibilidade em datas passadas', 400);
    }

    // Validar horários (fim deve ser maior que início)
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      throw new AppError('Horário final deve ser maior que horário inicial', 400);
    }

    // Verificar conflito com outras indisponibilidades
    const conflict = await doctorUnavailabilityRepository.checkConflict(
      doctorId,
      unavailableDate,
      startTime,
      endTime
    );

    if (conflict) {
      throw new AppError('Já existe indisponibilidade neste período', 400);
    }

    // Verificar se há consultas agendadas neste período
    const appointments = await appointmentRepository.findAll({
      doctorId,
      date: unavailableDate,
    });

    const conflictingAppointments = appointments.filter((appointment) => {
      if (['CANCELADA', 'FALTOU'].includes(appointment.status)) {
        return false;
      }

      const appointmentTime = appointment.appointmentTime.toISOString().substring(11, 16);
      const appointmentMinutes = timeToMinutes(appointmentTime);

      return appointmentMinutes >= startMinutes && appointmentMinutes < endMinutes;
    });

    if (conflictingAppointments.length > 0) {
      throw new AppError('Existem consultas agendadas neste período. Cancele-as primeiro.', 400);
    }

    // Criar indisponibilidade
    const unavailability = await doctorUnavailabilityRepository.create({
      doctorId,
      unavailableDate: new Date(unavailableDate),
      startTime: new Date(`1970-01-01T${startTime}:00`),
      endTime: new Date(`1970-01-01T${endTime}:00`),
      reason: reason?.trim() || null,
    });

    return unavailability;
  }

  /**
    Buscar indisponibilidade por ID
    @param {string} id - ID da indisponibilidade
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Indisponibilidade encontrada
   */
  async findById(id, requestUserId, requestUserRole) {
    const unavailability = await doctorUnavailabilityRepository.findById(id);

    if (!unavailability) {
      throw new AppError('Indisponibilidade não encontrada', 404);
    }

    // Verificar permissão: DOCTOR só pode ver suas próprias
    if (requestUserRole === 'DOCTOR' && unavailability.doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para ver esta indisponibilidade', 403);
    }

    return unavailability;
  }

  /**
    Listar indisponibilidades
    @param {Object} filters - Filtros opcionais
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Array>} - Lista de indisponibilidades
   */
  async findAll(filters, requestUserId, requestUserRole) {
    // Se for DOCTOR, só mostra suas indisponibilidades
    if (requestUserRole === 'DOCTOR') {
      const doctor = await doctorRepository.findByUserId(requestUserId);
      if (!doctor) {
        throw new AppError('Médico não encontrado', 404);
      }
      filters.doctorId = doctor.id;
    }

    return await doctorUnavailabilityRepository.findAll(filters);
  }

  /**
    Listar indisponibilidades futuras de um médico
    @param {string} doctorId - ID do médico
    @returns {Promise<Array>} - Lista de indisponibilidades
   */
  async findFutureByDoctor(doctorId) {
    // Verificar se médico existe
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    return await doctorUnavailabilityRepository.findFutureByDoctor(doctorId);
  }

  /**
   * Atualizar indisponibilidade
    @param {string} id - ID da indisponibilidade
    @param {Object} data - Dados a atualizar
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Indisponibilidade atualizada
   */
  async update(id, data, requestUserId, requestUserRole) {
    // Buscar indisponibilidade
    const unavailability = await doctorUnavailabilityRepository.findById(id);

    if (!unavailability) {
      throw new AppError('Indisponibilidade não encontrada', 404);
    }

    // Verificar permissão: DOCTOR só pode editar suas próprias
    if (requestUserRole === 'DOCTOR' && unavailability.doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para editar esta indisponibilidade', 403);
    }

    // Não pode editar indisponibilidades passadas
    const unavailableDate = new Date(unavailability.unavailableDate);
    if (isPastDate(unavailableDate)) {
      throw new AppError('Não é possível editar indisponibilidade de data passada', 400);
    }

    const updateData = {};

    // Atualizar data
    if (data.unavailableDate) {
      if (!validateDateFormat(data.unavailableDate)) {
        throw new AppError('Formato de data inválido. Use YYYY-MM-DD', 400);
      }

      const newDate = new Date(data.unavailableDate);
      if (isPastDate(newDate)) {
        throw new AppError('Não é possível definir data passada', 400);
      }

      updateData.unavailableDate = newDate;
    }

    // Atualizar horários
    const newStartTime = data.startTime || unavailability.startTime.toISOString().substring(11, 16);
    const newEndTime = data.endTime || unavailability.endTime.toISOString().substring(11, 16);

    if (data.startTime && !validateTime(data.startTime)) {
      throw new AppError('Formato de horário inicial inválido. Use HH:MM', 400);
    }

    if (data.endTime && !validateTime(data.endTime)) {
      throw new AppError('Formato de horário final inválido. Use HH:MM', 400);
    }

    // Validar horários
    const startMinutes = timeToMinutes(newStartTime);
    const endMinutes = timeToMinutes(newEndTime);

    if (endMinutes <= startMinutes) {
      throw new AppError('Horário final deve ser maior que horário inicial', 400);
    }

    if (data.startTime) {
      updateData.startTime = new Date(`1970-01-01T${newStartTime}:00`);
    }

    if (data.endTime) {
      updateData.endTime = new Date(`1970-01-01T${newEndTime}:00`);
    }

    // Verificar conflito (excluindo a própria indisponibilidade)
    const newDate = data.unavailableDate || formatDateToString(unavailableDate);
    const conflict = await doctorUnavailabilityRepository.checkConflict(
      unavailability.doctorId,
      newDate,
      newStartTime,
      newEndTime,
      id
    );

    if (conflict) {
      throw new AppError('Já existe indisponibilidade neste período', 400);
    }

    if (data.reason !== undefined) {
      updateData.reason = data.reason?.trim() || null;
    }

    // Atualizar
    const updatedUnavailability = await doctorUnavailabilityRepository.update(id, updateData);

    return updatedUnavailability;
  }

  /**
    Deletar indisponibilidade
    @param {string} id - ID da indisponibilidade
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<void>}
   */
  async delete(id, requestUserId, requestUserRole) {
    // Buscar indisponibilidade
    const unavailability = await doctorUnavailabilityRepository.findById(id);

    if (!unavailability) {
      throw new AppError('Indisponibilidade não encontrada', 404);
    }

    // Verificar permissão: DOCTOR só pode deletar suas próprias
    if (requestUserRole === 'DOCTOR' && unavailability.doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para deletar esta indisponibilidade', 403);
    }

    // Deletar
    await doctorUnavailabilityRepository.delete(id);
  }

  /**
    Deletar indisponibilidades passadas de um médico
    @param {string} doctorId - ID do médico
    @returns {Promise<Object>} - Resultado da operação
   */
  async deletePastByDoctor(doctorId) {
    // Verificar se médico existe
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    return await doctorUnavailabilityRepository.deletePastByDoctor(doctorId);
  }
}

module.exports = new DoctorUnavailabilityService();