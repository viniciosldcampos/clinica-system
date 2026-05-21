const prisma = require('../config/database');

class AppointmentRepository {
  /**
   * Criar uma nova consulta
    @param {Object} data - Dados da consulta
    @returns {Promise<Object>} - Consulta criada
   */
  async create(data) {
    return await prisma.appointment.create({
      data,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });
  }

  /**
   * Buscar consulta por ID
    @param {string} id - ID da consulta
    @returns {Promise<Object|null>} - Consulta encontrada ou null
   */
  async findById(id) {
    return await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
            birthDate: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            crm: true,
            specialty: true,
            phone: true,
          },
        },
        notifications: true,
      },
    });
  }

  /**
   * Listar todas as consultas
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de consultas
   */
  async findAll(filters = {}) {
    const where = {};

    // Filtro por paciente
    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    // Filtro por médico
    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    // Filtro por data
    if (filters.date) {
      where.appointmentDate = new Date(filters.date);
    }

    // Filtro por período
    if (filters.startDate && filters.endDate) {
      where.appointmentDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    // Filtro por status
    if (filters.status) {
      where.status = filters.status;
    }

    return await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' },
      ],
    });
  }

  /**
   * Buscar consultas de um paciente
    @param {string} patientId - ID do paciente
    @returns {Promise<Array>} - Lista de consultas
   */
  async findByPatient(patientId) {
    return await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' },
      ],
    });
  }

  /**
   * Buscar consultas de um médico
    @param {string} doctorId - ID do médico
    @returns {Promise<Array>} - Lista de consultas
   */
  async findByDoctor(doctorId) {
    return await prisma.appointment.findMany({
      where: { doctorId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'desc' },
      ],
    });
  }

  /**
   * Buscar consultas futuras
    @returns {Promise<Array>} - Lista de consultas
   */
  async findUpcoming() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: today,
        },
        status: {
          in: ['AGENDADA', 'CONFIRMADA'],
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' },
      ],
    });
  }

  /**
   * Buscar consultas de amanhã
    @returns {Promise<Array>} - Lista de consultas
   */
  async findTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    return await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: {
          in: ['AGENDADA', 'CONFIRMADA'],
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: {
        appointmentTime: 'asc',
      },
    });
  }

  /**
   * Verificar conflito de horário para médico
    @param {string} doctorId - ID do médico
    @param {Date} date - Data da consulta
    @param {string} time - Horário da consulta
    @param {string} excludeAppointmentId - ID da consulta a excluir (para update)
    @returns {Promise<Object|null>} - Consulta conflitante ou null
   */
  async checkDoctorConflict(doctorId, date, time, excludeAppointmentId = null) {
    const where = {
      doctorId,
      appointmentDate: new Date(date),
      appointmentTime: new Date(`1970-01-01T${time}:00`),
      status: {
        notIn: ['CANCELADA', 'FALTOU'],
      },
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    return await prisma.appointment.findFirst({ where });
  }

  /**
   * Verificar conflito de horário para paciente
    @param {string} patientId - ID do paciente
    @param {Date} date - Data da consulta
    @param {string} time - Horário da consulta
    @param {string} excludeAppointmentId - ID da consulta a excluir (para update)
    @returns {Promise<Object|null>} - Consulta conflitante ou null
   */
  async checkPatientConflict(patientId, date, time, excludeAppointmentId = null) {
    const where = {
      patientId,
      appointmentDate: new Date(date),
      appointmentTime: new Date(`1970-01-01T${time}:00`),
      status: {
        notIn: ['CANCELADA', 'FALTOU'],
      },
    };

    if (excludeAppointmentId) {
      where.id = { not: excludeAppointmentId };
    }

    return await prisma.appointment.findFirst({ where });
  }

  /**
   * Atualizar consulta
    @param {string} id - ID da consulta
    @param {Object} data - Dados a atualizar
    @returns {Promise<Object>} - Consulta atualizada
   */
  async update(id, data) {
    return await prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });
  }

  /**
   * Deletar consulta
    @param {string} id - ID da consulta
    @returns {Promise<Object>} - Consulta deletada
   */
  async delete(id) {
    return await prisma.appointment.delete({
      where: { id },
    });
  }

  /**
   * Contar consultas
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de consultas
   */
  async count(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    return await prisma.appointment.count({ where });
  }
}

module.exports = new AppointmentRepository();