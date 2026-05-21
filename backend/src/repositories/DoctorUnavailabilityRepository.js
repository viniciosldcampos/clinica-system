const prisma = require('../config/database');

class DoctorUnavailabilityRepository {
  /**
   * Criar nova indisponibilidade
    @param {Object} data - Dados da indisponibilidade
    @returns {Promise<Object>} - Indisponibilidade criada
   */
  async create(data) {
    return await prisma.doctorUnavailability.create({
      data,
      include: {
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
   * Buscar indisponibilidade por ID
    @param {string} id - ID da indisponibilidade
    @returns {Promise<Object|null>} - Indisponibilidade encontrada ou null
   */
  async findById(id) {
    return await prisma.doctorUnavailability.findUnique({
      where: { id },
      include: {
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
   * Listar indisponibilidades de um médico
    @param {string} doctorId - ID do médico
    @returns {Promise<Array>} - Lista de indisponibilidades
   */
  async findByDoctor(doctorId) {
    return await prisma.doctorUnavailability.findMany({
      where: { doctorId },
      orderBy: {
        unavailableDate: 'asc',
      },
    });
  }

  /**
   * Listar indisponibilidades futuras de um médico
    @param {string} doctorId - ID do médico
    @returns {Promise<Array>} - Lista de indisponibilidades
   */
  async findFutureByDoctor(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.doctorUnavailability.findMany({
      where: {
        doctorId,
        unavailableDate: {
          gte: today,
        },
      },
      orderBy: {
        unavailableDate: 'asc',
      },
    });
  }

  /**
   * Buscar indisponibilidades em uma data específica
    @param {string} doctorId - ID do médico
    @param {Date} date - Data
    @returns {Promise<Array>} - Lista de indisponibilidades
   */
  async findByDoctorAndDate(doctorId, date) {
    return await prisma.doctorUnavailability.findMany({
      where: {
        doctorId,
        unavailableDate: new Date(date),
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Verificar se há indisponibilidade em um horário específico
    @param {string} doctorId - ID do médico
    @param {Date} date - Data
    @param {string} time - Horário HH:MM
    @returns {Promise<boolean>} - true se indisponível
   */
  async isUnavailable(doctorId, date, time) {
    const timeDate = new Date(`1970-01-01T${time}:00`);

    const unavailabilities = await prisma.doctorUnavailability.findMany({
      where: {
        doctorId,
        unavailableDate: new Date(date),
      },
    });

    // Verificar se o horário está dentro de algum período de indisponibilidade
    for (const unavailability of unavailabilities) {
      const startTime = new Date(unavailability.startTime);
      const endTime = new Date(unavailability.endTime);
      
      if (timeDate >= startTime && timeDate < endTime) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verificar conflito de indisponibilidade
    @param {string} doctorId - ID do médico
    @param {Date} date - Data
    @param {string} startTime - Horário inicial HH:MM
    @param {string} endTime - Horário final HH:MM
    @param {string} excludeId - ID da indisponibilidade a excluir (para update)
    @returns {Promise<Object|null>} - Indisponibilidade conflitante ou null
   */
  async checkConflict(doctorId, date, startTime, endTime, excludeId = null) {
    const where = {
      doctorId,
      unavailableDate: new Date(date),
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const unavailabilities = await prisma.doctorUnavailability.findMany({
      where,
    });

    const newStart = new Date(`1970-01-01T${startTime}:00`);
    const newEnd = new Date(`1970-01-01T${endTime}:00`);

    // Verificar se há sobreposição com indisponibilidades existentes
    for (const unavailability of unavailabilities) {
      const existingStart = new Date(unavailability.startTime);
      const existingEnd = new Date(unavailability.endTime);

      // Verifica se há sobreposição
      if (newStart < existingEnd && newEnd > existingStart) {
        return unavailability;
      }
    }

    return null;
  }

  /**
   * Listar todas as indisponibilidades
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de indisponibilidades
   */
  async findAll(filters = {}) {
    const where = {};

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.date) {
      where.unavailableDate = new Date(filters.date);
    }

    if (filters.startDate && filters.endDate) {
      where.unavailableDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    return await prisma.doctorUnavailability.findMany({
      where,
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
        { unavailableDate: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  /**
   * Atualizar indisponibilidade
    @param {string} id - ID da indisponibilidade
    @param {Object} data - Dados a atualizar
    @returns {Promise<Object>} - Indisponibilidade atualizada
   */
  async update(id, data) {
    return await prisma.doctorUnavailability.update({
      where: { id },
      data,
      include: {
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
   * Deletar indisponibilidade
    @param {string} id - ID da indisponibilidade
    @returns {Promise<Object>} - Indisponibilidade deletada
   */
  async delete(id) {
    return await prisma.doctorUnavailability.delete({
      where: { id },
    });
  }

  /**
   * Deletar indisponibilidades passadas de um médico
    @param {string} doctorId - ID do médico
    @returns {Promise<Object>} - Resultado da operação
   */
  async deletePastByDoctor(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.doctorUnavailability.deleteMany({
      where: {
        doctorId,
        unavailableDate: {
          lt: today,
        },
      },
    });
  }

  /**
   * Contar indisponibilidades
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de indisponibilidades
   */
  async count(filters = {}) {
    const where = {};

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    return await prisma.doctorUnavailability.count({ where });
  }
}

module.exports = new DoctorUnavailabilityRepository();