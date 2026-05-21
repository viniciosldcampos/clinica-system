const prisma = require('../config/database');

class DoctorRepository {
  /**
   * Criar um novo médico
    @param {Object} data - Dados do médico
    @returns {Promise<Object>} - Médico criado
   */
  async create(data) {
    return await prisma.doctor.create({
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
   * Buscar médico por ID
    @param {string} id - ID do médico
    @returns {Promise<Object|null>} - Médico encontrado ou null
   */
  async findById(id) {
    return await prisma.doctor.findUnique({
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
            patient: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: {
            appointmentDate: 'desc',
          },
        },
        doctorUnavailability: {
          orderBy: {
            unavailableDate: 'asc',
          },
        },
      },
    });
  }

  /**
   * Buscar médico por user_id
    @param {string} userId - ID do usuário
    @returns {Promise<Object|null>} - Médico encontrado ou null
   */
  async findByUserId(userId) {
    return await prisma.doctor.findUnique({
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
   * Buscar médico por CRM
    @param {string} crm - CRM do médico
    @returns {Promise<Object|null>} - Médico encontrado ou null
   */
  async findByCRM(crm) {
    return await prisma.doctor.findUnique({
      where: { crm },
    });
  }

  /**
   * Listar todos os médicos
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de médicos
   */
  async findAll(filters = {}) {
    const where = {};

    // Filtro por nome (busca parcial)
    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    // Filtro por especialidade
    if (filters.specialty) {
      where.specialty = {
        contains: filters.specialty,
        mode: 'insensitive',
      };
    }

    // Filtro por CRM
    if (filters.crm) {
      where.crm = filters.crm;
    }

    return await prisma.doctor.findMany({
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
   * Listar médicos ativos
    @returns {Promise<Array>} - Lista de médicos ativos
   */
  async findActive() {
    return await prisma.doctor.findMany({
      where: {
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Atualizar médico
    @param {string} id - ID do médico
    @param {Object} data - Dados a atualizar
    @returns {Promise<Object>} - Médico atualizado
   */
  async update(id, data) {
    return await prisma.doctor.update({
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
   * Deletar médico
    @param {string} id - ID do médico
    @returns {Promise<Object>} - Médico deletado
   */
  async delete(id) {
    return await prisma.doctor.delete({
      where: { id },
    });
  }

  /**
   * Contar médicos
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de médicos
   */
  async count(filters = {}) {
    const where = {};

    if (filters.specialty) {
      where.specialty = {
        contains: filters.specialty,
        mode: 'insensitive',
      };
    }

    return await prisma.doctor.count({ where });
  }

  /**
   * Buscar especialidades únicas
    @returns {Promise<Array>} - Lista de especialidades
   */
  async findUniqueSpecialties() {
    const doctors = await prisma.doctor.findMany({
      select: {
        specialty: true,
      },
      distinct: ['specialty'],
      orderBy: {
        specialty: 'asc',
      },
    });

    return doctors.map((doctor) => doctor.specialty);
  }

  /**
   * Buscar médicos por especialidade
    @param {string} specialty - Especialidade
    @returns {Promise<Array>} - Lista de médicos
   */
  async findBySpecialty(specialty) {
    return await prisma.doctor.findMany({
      where: {
        specialty: {
          equals: specialty,
          mode: 'insensitive',
        },
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

module.exports = new DoctorRepository();