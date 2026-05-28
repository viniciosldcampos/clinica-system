const AppError = require('../utils/AppError');
const appointmentRepository = require('../repositories/AppointmentRepository');
const patientRepository = require('../repositories/PatientRepository');
const doctorRepository = require('../repositories/DoctorRepository');
const {
  isPastDate,
  canScheduleWithMinAdvance,
  canCancelWithMinAdvance,
  isWorkDay,
  isWithinWorkHours,
} = require('../utils/dateHelpers');
const env = require('../config/env');

class AppointmentService {
  /**
    Criar nova consulta
    @param {Object} data - Dados da consulta
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta criada
   */

async create(data, requestUserId, requestUserRole) {
  const { patientId, doctorId, appointmentDate, appointmentDateEnd, notes } = data;

  console.log('📋 Dados recebidos:', { patientId, doctorId, appointmentDate, appointmentDateEnd });

  // Validações básicas
  if (!patientId) {
    throw new AppError('ID do paciente é obrigatório', 400);
  }

  if (!doctorId) {
    throw new AppError('ID do médico é obrigatório', 400);
  }

  if (!appointmentDate) {
    throw new AppError('Data e hora de entrada é obrigatória', 400);
  }

  if (!appointmentDateEnd) {
    throw new AppError('Data e hora de saída é obrigatória', 400);
  }

  // Converter strings para Date corretamente
  let startDate, endDate;
  
  try {
    startDate = new Date(appointmentDate);
    endDate = new Date(appointmentDateEnd);

    console.log('📅 Datas convertidas:', { startDate, endDate });

    if (isNaN(startDate.getTime())) {
      throw new AppError('Formato de data de entrada inválido', 400);
    }

    if (isNaN(endDate.getTime())) {
      throw new AppError('Formato de data de saída inválido', 400);
    }
  } catch (error) {
    console.error('❌ Erro ao converter datas:', error.message);
    throw new AppError('Formato de data inválido', 400);
  }

  // Validar se fim é após início
  if (endDate <= startDate) {
    throw new AppError('A hora de saída deve ser após a hora de entrada', 400);
  }

  // Calcular duração em minutos
  const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));

  console.log('⏱️ Duração calculada:', durationMinutes, 'minutos');

  if (durationMinutes < 20) {
    throw new AppError('A duração mínima da consulta é 20 minutos', 400);
  }

  // Verificar se paciente existe
  const patient = await patientRepository.findById(patientId);
  if (!patient) {
    throw new AppError('Paciente não encontrado', 404);
  }

  // Se for PATIENT, só pode agendar para si mesmo
  if (requestUserRole === 'PATIENT' && patient.userId !== requestUserId) {
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
  if (isPastDate(startDate)) {
    throw new AppError('Não é possível agendar em datas passadas', 400);
  }

  // Validar antecedência mínima
  if (!canScheduleWithMinAdvance(startDate)) {
    throw new AppError(`É necessário agendar com ${env.MIN_DAYS_ADVANCE} dias de antecedência`, 400);
  }

  // Validar dia útil (seg-sáb)
  if (!isWorkDay(startDate)) {
    throw new AppError('A clínica não funciona neste dia da semana', 400);
  }

  // Validar horário de funcionamento
  const hourStart = startDate.getHours();
  const hourEnd = endDate.getHours();
  if (hourStart < 8 || hourEnd > 18) {
    throw new AppError('Horário deve ser entre 8h e 18h', 400);
  }

  // Verificar conflito de horário do médico
  const dateStr = startDate.toISOString().split('T')[0];
  const doctorConflict = await appointmentRepository.findAll({
    doctorId,
    dateFrom: dateStr,
    dateTo: dateStr,
  });

  console.log('🔍 Verificando conflitos do médico. Consultas encontradas:', doctorConflict.length);

  const hasConflict = doctorConflict.some(apt => {
    if (['CANCELADA', 'FALTOU'].includes(apt.status)) return false;
    
    const aptStart = new Date(apt.appointmentDate);
    const aptEnd = new Date(apt.appointmentDateEnd);
    
    const conflicts = (startDate < aptEnd && endDate > aptStart);
    console.log('  - Consultando conflito:', { aptStart, aptEnd, conflicts });
    return conflicts;
  });

  if (hasConflict) {
    throw new AppError('Médico já possui consulta agendada neste horário', 400);
  }

  // Verificar conflito de horário do paciente
  const patientConflict = await appointmentRepository.findAll({
    patientId,
    dateFrom: dateStr,
    dateTo: dateStr,
  });

  console.log('🔍 Verificando conflitos do paciente. Consultas encontradas:', patientConflict.length);

  const patientHasConflict = patientConflict.some(apt => {
    if (['CANCELADA', 'FALTOU'].includes(apt.status)) return false;
    
    const aptStart = new Date(apt.appointmentDate);
    const aptEnd = new Date(apt.appointmentDateEnd);
    
    const conflicts = (startDate < aptEnd && endDate > aptStart);
    console.log('  - Consultando conflito:', { aptStart, aptEnd, conflicts });
    return conflicts;
  });

  if (patientHasConflict) {
    throw new AppError('Você já possui consulta agendada neste horário', 400);
  }

  // Preparar dados para o Prisma
  const createData = {
    patientId,
    doctorId,
    appointmentDate: startDate, // Prisma vai converter para o tipo correto
    appointmentDateEnd: endDate, // Prisma vai converter para o tipo correto
    durationMinutes,
    status: 'AGENDADA',
    notes: notes?.trim() || null,
  };

  console.log('💾 Dados a serem salvos:', createData);

  // Criar consulta
  const appointment = await appointmentRepository.create(createData);

  console.log('✅ Consulta criada com sucesso:', appointment.id);

  return appointment;
}


  /**
    Buscar consulta por ID
    @param {string} id - ID da consulta
    @returns {Promise<Object>} - Consulta encontrada
   */
  async findById(id) {
    const appointment = await appointmentRepository.findById(id);

    if (!appointment) {
      throw new AppError('Consulta não encontrada', 404);
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
    Buscar minhas consultas
    @param {string} userId - ID do usuário
    @param {string} userRole - Role do usuário
    @returns {Promise<Array>} - Lista de consultas
   */
  async findMyAppointments(userId, userRole) {
    if (userRole === 'PATIENT') {
      const patient = await patientRepository.findByUserId(userId);
      if (!patient) {
        throw new AppError('Paciente não encontrado', 404);
      }
      return await appointmentRepository.findByPatient(patient.id);
    }

    if (userRole === 'DOCTOR') {
      const doctor = await doctorRepository.findByUserId(userId);
      if (!doctor) {
        throw new AppError('Médico não encontrado', 404);
      }
      return await appointmentRepository.findByDoctor(doctor.id);
    }

    throw new AppError('Role inválido', 400);
  }

  /**
    Buscar consultas futuras
    @returns {Promise<Array>} - Lista de consultas
   */
  async findUpcoming() {
    return await appointmentRepository.findUpcoming();
  }

  /**
    Atualizar/Reagendar consulta
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

    // Verificar permissão
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
    if (data.appointmentDate || data.appointmentDateEnd) {
      const newStartDate = data.appointmentDate ? new Date(data.appointmentDate) : new Date(appointment.appointmentDate);
      const newEndDate = data.appointmentDateEnd ? new Date(data.appointmentDateEnd) : new Date(appointment.appointmentDateEnd);

      // Validações
      if (isPastDate(newStartDate)) {
        throw new AppError('Não é possível agendar em datas passadas', 400);
      }

      if (!canScheduleWithMinAdvance(newStartDate)) {
        throw new AppError(`É necessário agendar com ${env.MIN_DAYS_ADVANCE} dias de antecedência`, 400);
      }

      if (!isWorkDay(newStartDate)) {
        throw new AppError('A clínica não funciona neste dia da semana', 400);
      }

      if (newEndDate <= newStartDate) {
        throw new AppError('A hora de saída deve ser após a hora de entrada', 400);
      }

      const hourStart = newStartDate.getHours();
      const hourEnd = newEndDate.getHours();
      if (hourStart < 8 || hourEnd > 18) {
        throw new AppError('Horário deve ser entre 8h e 18h', 400);
      }

      // Verificar conflitos (excluindo a própria consulta)
      const doctorAppointments = await appointmentRepository.findAll({
        doctorId: appointment.doctorId,
        dateFrom: newStartDate.toISOString().split('T')[0],
        dateTo: newStartDate.toISOString().split('T')[0],
      });

      const hasDoctoConflict = doctorAppointments.some(apt => {
        if (apt.id === id) return false; // Excluir a própria consulta
        if (['CANCELADA', 'FALTOU'].includes(apt.status)) return false;
        
        const aptStart = new Date(apt.appointmentDate);
        const aptEnd = new Date(apt.appointmentDateEnd);
        
        return (newStartDate < aptEnd && newEndDate > aptStart);
      });

      if (hasDoctoConflict) {
        throw new AppError('Médico já possui consulta agendada neste horário', 400);
      }

      const patientAppointments = await appointmentRepository.findAll({
        patientId: appointment.patientId,
        dateFrom: newStartDate.toISOString().split('T')[0],
        dateTo: newStartDate.toISOString().split('T')[0],
      });

      const hasPatientConflict = patientAppointments.some(apt => {
        if (apt.id === id) return false; // Excluir a própria consulta
        if (['CANCELADA', 'FALTOU'].includes(apt.status)) return false;
        
        const aptStart = new Date(apt.appointmentDate);
        const aptEnd = new Date(apt.appointmentDateEnd);
        
        return (newStartDate < aptEnd && newEndDate > aptStart);
      });

      if (hasPatientConflict) {
        throw new AppError('Você já possui consulta agendada neste horário', 400);
      }

      if (data.appointmentDate) {
        updateData.appointmentDate = newStartDate;
      }

      if (data.appointmentDateEnd) {
        updateData.appointmentDateEnd = newEndDate;
        // Recalcular duração
        const durationMinutes = Math.round((newEndDate - newStartDate) / (1000 * 60));
        updateData.durationMinutes = durationMinutes;
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
    @param {string} reason - Motivo do cancelamento
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta cancelada
   */
  async cancel(id, reason, requestUserId, requestUserRole) {
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
      cancelReason: reason?.trim() || null,
    });

    return canceledAppointment;
  }

  /**
    Atualizar status da consulta (apenas ADMIN e DOCTOR)
    @param {string} id - ID da consulta
    @param {string} status - Novo status
    @param {string} requestUserId - ID do usuário que faz a requisição
    @param {string} requestUserRole - Role do usuário que faz a requisição
    @returns {Promise<Object>} - Consulta atualizada
   */
  async updateStatus(id, status, requestUserId, requestUserRole) {
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

    // Se for DOCTOR, só pode atualizar suas consultas
    if (requestUserRole === 'DOCTOR' && appointment.doctor.userId !== requestUserId) {
      throw new AppError('Você não tem permissão para alterar o status desta consulta', 403);
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