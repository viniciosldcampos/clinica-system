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
            cpf: true,
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
            phone: true,
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
            user: {
              select: {
                isActive: true,
              },
            },
          },
        },
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

    // Filtro por status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filtro por período
    if (filters.dateFrom && filters.dateTo) {
      const startDate = new Date(filters.dateFrom);
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);

      where.appointmentDate = {
        gte: startDate,
        lte: endDate,
      };
    } else if (filters.dateFrom) {
      where.appointmentDate = {
        gte: new Date(filters.dateFrom),
      };
    } else if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.appointmentDate = {
        lte: endDate,
      };
    }

    return await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
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
      orderBy: {
        appointmentDate: 'asc',
      },
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
      orderBy: {
        appointmentDate: 'desc',
      },
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
            cpf: true,
            phone: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });
  }

  /**
   * Buscar consultas futuras
    @returns {Promise<Array>} - Lista de consultas
   */
  async findUpcoming() {
    const now = new Date();

    return await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: now,
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
        appointmentDate: 'asc',
      },
    });
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
            cpf: true,
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
            phone: true,
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