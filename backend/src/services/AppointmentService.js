const AppError = require('../utils/AppError');
const appointmentRepository = require('../repositories/AppointmentRepository');
const patientRepository = require('../repositories/PatientRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const doctorUnavailabilityRepository = require('../repositories/DoctorUnavailabilityRepository');
const {
  validateDateFormat,
  validateTime,
  isWorkDay,
  isWithinWorkHours,
  isPastDate,
  canScheduleWithMinAdvance,
  canCancelWithMinAdvance,
  formatDateToString,
} = require('../utils/dateHelpers');
const env = require('../config/env');

class AppointmentService {
  /**
    Criar nova consulta (apenas PATIENT)
    @param {Object} data - Dados da consulta
    @param {string} requestUserId - ID do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta criada
   */
  async create(data, requestUserId) {
    const { patientId, doctorId, appointmentDate, appointmentTime, durationMinutes, notes } = data;

    // Validações básicas
    if (!patientId) {
      throw new AppError('ID do paciente é obrigatório', 400);
    }

    if (!doctorId) {
      throw new AppError('ID do médico é obrigatório', 400);
    }

    if (!appointmentDate) {
      throw new AppError('Data da consulta é obrigatória', 400);
    }

    if (!appointmentTime) {
      throw new AppError('Horário da consulta é obrigatório', 400);
    }

    // Validar formato de data e hora
    if (!validateDateFormat(appointmentDate)) {
      throw new AppError('Formato de data inválido. Use YYYY-MM-DD', 400);
    }

    if (!validateTime(appointmentTime)) {
      throw new AppError('Formato de horário inválido. Use HH:MM', 400);
    }

    // Verificar se paciente existe
    const patient = await patientRepository.findById(patientId);
    if (!patient) {
      throw new AppError('Paciente não encontrado', 404);
    }

    // Verificar se o paciente logado está tentando agendar para si mesmo
    if (patient.userId !== requestUserId) {
      throw new AppError('Você só pode agendar consultas para si mesmo', 403);
    }

    // Verificar se médico existe e está ativo
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError('Médico não encontrado', 404);
    }

    if (!doctor.user.isActive) {
      throw new AppError('Médico inativo', 400);
    }

    // Validar data (não pode ser passada)
    const date = new Date(appointmentDate);
    if (isPastDate(date)) {
      throw new AppError('Não é possível agendar em datas passadas', 400);
    }

    // Validar antecedência mínima
    if (!canScheduleWithMinAdvance(date)) {
      throw new AppError(`É necessário agendar com ${env.MIN_DAYS_ADVANCE} dias de antecedência`, 400);
    }

    // Validar dia útil
    if (!isWorkDay(date)) {
      throw new AppError('A clínica não funciona neste dia da semana', 400);
    }

    // Validar horário de funcionamento
    if (!isWithinWorkHours(appointmentTime)) {
      throw new AppError(`Horário fora do expediente. Funcionamento: ${env.CLINIC_OPEN_TIME} às ${env.CLINIC_CLOSE_TIME}`, 400);
    }

    // Verificar conflito de horário do médico
    const doctorConflict = await appointmentRepository.checkDoctorConflict(
      doctorId,
      appointmentDate,
      appointmentTime
    );

    if (doctorConflict) {
      throw new AppError('Médico já possui consulta agendada neste horário', 400);
    }

    // Verificar conflito de horário do paciente
    const patientConflict = await appointmentRepository.checkPatientConflict(
      patientId,
      appointmentDate,
      appointmentTime
    );

    if (patientConflict) {
      throw new AppError('Você já possui consulta agendada neste horário', 400);
    }

    // Verificar indisponibilidade do médico
    const isUnavailable = await doctorUnavailabilityRepository.isUnavailable(
      doctorId,
      appointmentDate,
      appointmentTime
    );

    if (isUnavailable) {
      throw new AppError('Médico indisponível neste horário', 400);
    }

    // Criar consulta
    const appointment = await appointmentRepository.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime: new Date(`1970-01-01T${appointmentTime}:00`),
      durationMinutes: durationMinutes || env.DEFAULT_APPOINTMENT_DURATION,
      status: 'AGENDADA',
      notes: notes?.trim() || null,
    });

    return appointment;
  }

  /**
    Buscar consulta por ID
    @param {string} id - ID da consulta
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta encontrada
   */
  async findById(id, requestUserId, requestUserRole) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    // Verificar permissão: PATIENT só pode ver suas consultas, DOCTOR só pode ver suas consultas
    if (requestUserRole === 'PATIENT' && appointment.patient.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para ver esta consulta', 403);
    }

    if (requestUserRole === 'DOCTOR' && appointment.doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para ver esta consulta', 403);
    }

    return appointment;
  }

  /**
    Listar todas as consultas
    @param {Object} filters - Filtros opcionais
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Array>} - Lista de consultas
   */
  async findAll(filters, requestUserId, requestUserRole) {
    // Se for PATIENT, só mostra suas consultas
    if (requestUserRole === 'PATIENT') {
      const patient = await patientRepository.findByUserId(requestUserId);
      if (!patient) {
        throw new AppError('Paciente não encontrado', 404);
      }
      filters.patientId = patient.id;
    }

    // Se for DOCTOR, só mostra suas consultas
    if (requestUserRole === 'DOCTOR') {
      const doctor = await doctorRepository.findByUserId(requestUserId);
      if (!doctor) {
        throw new AppError('Médico não encontrado', 404);
      }
      filters.doctorId = doctor.id;
    }

    return await appointmentRepository.findAll(filters);
  }

  /**
    Buscar consultas futuras
    @returns {Promise<Array>} - Lista de consultas
   */
  async findUpcoming() {
    return await appointmentRepository.findUpcoming();
  }

  /**
    Atualizar consulta (reagendar)
    @param {string} id - ID da consulta
    @param {Object} data - Dados a atualizar
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta atualizada
   */
  async update(id, data, requestUserId, requestUserRole) {
    // Buscar consulta
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    // Verificar permissão: apenas ADMIN ou o próprio PATIENT pode reagendar
    if (requestUserRole === 'PATIENT' && appointment.patient.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para editar esta consulta', 403);
    }

    if (requestUserRole === 'DOCTOR') {
      throw new AppError('Médicos não podem reagendar consultas', 403);
    }

    // Não pode reagendar consultas já realizadas ou canceladas
    if (['REALIZADA', 'CANCELADA', 'FALTOU'].includes(appointment.status)) {
      throw new AppError(`Não é possível reagendar consulta com status ${appointment.status}`, 400);
    }

    // Validar antecedência para reagendamento
    const appointmentDate = new Date(appointment.appointmentDate);
    if (!canCancelWithMinAdvance(appointmentDate)) {
      throw new AppError(`É necessário ${env.MIN_DAYS_CANCEL} dias de antecedência para reagendar`, 400);
    }

    const updateData = {};

    // Se está alterando data/hora, validar tudo novamente
    if (data.appointmentDate || data.appointmentTime) {
      const newDate = data.appointmentDate || formatDateToString(new Date(appointment.appointmentDate));
      const newTime = data.appointmentTime || appointment.appointmentTime.toISOString().substring(11, 16);

      // Validações
      const date = new Date(newDate);
      if (isPastDate(date)) {
        throw new AppError('Não é possível agendar em datas passadas', 400);
      }

      if (!canScheduleWithMinAdvance(date)) {
        throw new AppError(`É necessário agendar com ${env.MIN_DAYS_ADVANCE} dias de antecedência`, 400);
      }

      if (!isWorkDay(date)) {
        throw new AppError('A clínica não funciona neste dia da semana', 400);
      }

      if (!isWithinWorkHours(newTime)) {
        throw new AppError(`Horário fora do expediente. Funcionamento: ${env.CLINIC_OPEN_TIME} às ${env.CLINIC_CLOSE_TIME}`, 400);
      }

      // Verificar conflitos (excluindo a própria consulta)
      const doctorConflict = await appointmentRepository.checkDoctorConflict(
        appointment.doctorId,
        newDate,
        newTime,
        id
      );

      if (doctorConflict) {
        throw new AppError('Médico já possui consulta agendada neste horário', 400);
      }

      const patientConflict = await appointmentRepository.checkPatientConflict(
        appointment.patientId,
        newDate,
        newTime,
        id
      );

      if (patientConflict) {
        throw new AppError('Você já possui consulta agendada neste horário', 400);
      }

      // Verificar indisponibilidade
      const isUnavailable = await doctorUnavailabilityRepository.isUnavailable(
        appointment.doctorId,
        newDate,
        newTime
      );

      if (isUnavailable) {
        throw new AppError('Médico indisponível neste horário', 400);
      }

      if (data.appointmentDate) {
        updateData.appointmentDate = new Date(newDate);
      }

      if (data.appointmentTime) {
        updateData.appointmentTime = new Date(`1970-01-01T${newTime}:00`);
      }
    }

    if (data.notes !== undefined) {
      updateData.notes = data.notes?.trim() || null;
    }

    // Atualizar
    const updatedAppointment = await appointmentRepository.update(id, updateData);

    return updatedAppointment;
  }

  /**
    Cancelar consulta
    @param {string} id - ID da consulta
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta cancelada
   */
  async cancel(id, requestUserId, requestUserRole) {
    // Buscar consulta
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    // Verificar permissão
    if (requestUserRole === 'PATIENT' && appointment.patient.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para cancelar esta consulta', 403);
    }

    if (requestUserRole === 'DOCTOR' && appointment.doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para cancelar esta consulta', 403);
    }

    // Não pode cancelar consultas já realizadas ou já canceladas
    if (['REALIZADA', 'CANCELADA', 'FALTOU'].includes(appointment.status)) {
      throw new AppError(`Não é possível cancelar consulta com status ${appointment.status}`, 400);
    }

    // Validar antecedência para cancelamento (apenas para pacientes)
    if (requestUserRole === 'PATIENT') {
      const appointmentDate = new Date(appointment.appointmentDate);
      if (!canCancelWithMinAdvance(appointmentDate)) {
        throw new AppError(`É necessário ${env.MIN_DAYS_CANCEL} dias de antecedência para cancelar`, 400);
      }
    }

    // Cancelar
    const canceledAppointment = await appointmentRepository.update(id, {
      status: 'CANCELADA',
    });

    return canceledAppointment;
  }

  /**
    Atualizar status da consulta (apenas ADMIN e DOCTOR)
    @param {string} id - ID da consulta
    @param {string} status - Novo status
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta atualizada
   */
  async updateStatus(id, status, requestUserRole) {
    // Apenas ADMIN e DOCTOR podem alterar status
    if (!['ADMIN', 'DOCTOR'].includes(requestUserRole)) {
      throw new AppError('Você não tem permissão para alterar o status da consulta', 403);
    }

    // Validar status
    const validStatuses = ['AGENDADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'FALTOU'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Status inválido. Use: ${validStatuses.join(', ')}`, 400);
    }

    // Buscar consulta
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    // Atualizar status
    const updatedAppointment = await appointmentRepository.update(id, { status });

    return updatedAppointment;
  }

  /**
    Deletar consulta (apenas ADMIN)
    @param {string} id - ID da consulta
    @returns {Promise<void>}
   */
  async delete(id) {
    // Verificar se consulta existe
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
    }

    // Deletar
    await appointmentRepository.delete(id);
  }

  /**
    Contar consultas
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de consultas
   */
  async count(filters = {}) {
    return await appointmentRepository.count(filters);
  }
}

module.exports = new AppointmentService();