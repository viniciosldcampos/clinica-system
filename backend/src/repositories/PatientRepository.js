const prisma = require('../config/database');

class PatientRepository {
  /**
   * Criar um novo paciente
    @param {Object} data - Dados do paciente
    @returns {Promise<Object>} - Paciente criado
   */
  async create(data) {
    return await prisma.patient.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  /**
   * Buscar paciente por ID
    @param {string} id - ID do paciente
    @returns {Promise<Object|null>} - Paciente encontrado ou null
   */
  async findById(id) {
    return await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        appointments: {
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
        },
      },
    });
  }

  /**
   * Buscar paciente por user_id
    @param {string} userId - ID do usuário
    @returns {Promise<Object|null>} - Paciente encontrado ou null
   */
  async findByUserId(userId) {
    return await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  /**
   * Buscar paciente por CPF
    @param {string} cpf - CPF do paciente
    @returns {Promise<Object|null>} - Paciente encontrado ou null
   */
  async findByCPF(cpf) {
    return await prisma.patient.findUnique({
      where: { cpf },
    });
  }

  /**
   * Listar todos os pacientes
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de pacientes
   */
  async findAll(filters = {}) {
    const where = {};

    // Filtro por nome (busca parcial)
    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive', // Case insensitive
      };
    }

    // Filtro por CPF
    if (filters.cpf) {
      where.cpf = filters.cpf;
    }

    // Filtro por telefone
    if (filters.phone) {
      where.phone = filters.phone;
    }

    return await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Atualizar paciente
    @param {string} id - ID do paciente
    @param {Object} data - Dados a atualizar
    @returns {Promise<Object>} - Paciente atualizado
   */
  async update(id, data) {
    return await prisma.patient.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  /**
   * Deletar paciente
    @param {string} id - ID do paciente
    @returns {Promise<Object>} - Paciente deletado
   */
  async delete(id) {
    return await prisma.patient.delete({
      where: { id },
    });
  }

  /**
   * Contar pacientes
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de pacientes
   */
  async count(filters = {}) {
    const where = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    return await prisma.patient.count({ where });
  }

  /**
   * Buscar pacientes com consultas futuras
    @returns {Promise<Array>} - Lista de pacientes
   */
  async findWithUpcomingAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.patient.findMany({
      where: {
        appointments: {
          some: {
            appointmentDate: {
              gte: today,
            },
            status: {
              in: ['AGENDADA', 'CONFIRMADA'],
            },
          },
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        appointments: {
          where: {
            appointmentDate: {
              gte: today,
            },
            status: {
              in: ['AGENDADA', 'CONFIRMADA'],
            },
          },
          include: {
            doctor: {
              select: {
                name: true,
                specialty: true,
              },
            },
          },
          orderBy: {
            appointmentDate: 'asc',
          },
        },
      },
    });
  }
}

module.exports = new PatientRepository();