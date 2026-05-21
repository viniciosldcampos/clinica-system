const prisma = require('../config/database');

class NotificationRepository {
  /**
   * Criar uma nova notificação
    @param {Object} data - Dados da notificação
    @returns {Promise<Object>} - Notificação criada
   */
  async create(data) {
    return await prisma.notification.create({
      data,
      include: {
        appointment: {
          include: {
            patient: {
              select: {
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
                name: true,
                specialty: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Buscar notificação por ID
    @param {string} id - ID da notificação
    @returns {Promise<Object|null>} - Notificação encontrada ou null
   */
  async findById(id) {
    return await prisma.notification.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
          },
        },
      },
    });
  }

  /**
   * Listar notificações de uma consulta
    @param {string} appointmentId - ID da consulta
    @returns {Promise<Array>} - Lista de notificações
   */
  async findByAppointment(appointmentId) {
    return await prisma.notification.findMany({
      where: { appointmentId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Listar notificações pendentes
    @returns {Promise<Array>} - Lista de notificações
   */
  async findPending() {
    return await prisma.notification.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
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
                name: true,
                specialty: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Listar notificações por status
    @param {string} status - Status da notificação
    @returns {Promise<Array>} - Lista de notificações
   */
  async findByStatus(status) {
    return await prisma.notification.findMany({
      where: { status },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                name: true,
              },
            },
            doctor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Listar notificações por tipo
    @param {string} type - Tipo da notificação
    @returns {Promise<Array>} - Lista de notificações
   */
  async findByType(type) {
    return await prisma.notification.findMany({
      where: { type },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Listar todas as notificações
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de notificações
   */
  async findAll(filters = {}) {
    const where = {};

    if (filters.appointmentId) {
      where.appointmentId = filters.appointmentId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return await prisma.notification.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                name: true,
                phone: true,
              },
            },
            doctor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Atualizar notificação
    @param {string} id - ID da notificação
    @param {Object} data - Dados a atualizar
    @returns {Promise<Object>} - Notificação atualizada
   */
  async update(id, data) {
    return await prisma.notification.update({
      where: { id },
      data,
    });
  }

  /**
   * Marcar notificação como enviada
    @param {string} id - ID da notificação
    @returns {Promise<Object>} - Notificação atualizada
   */
  async markAsSent(id) {
    return await prisma.notification.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  /**
   * Marcar notificação como falha
    @param {string} id - ID da notificação
    @param {string} errorMessage - Mensagem de erro
    @returns {Promise<Object>} - Notificação atualizada
   */
  async markAsFailed(id, errorMessage) {
    return await prisma.notification.update({
      where: { id },
      data: {
        status: 'FAILED',
        errorMessage,
      },
    });
  }

  /**
   * Deletar notificação
    @param {string} id - ID da notificação
    @returns {Promise<Object>} - Notificação deletada
   */
  async delete(id) {
    return await prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Contar notificações
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de notificações
   */
  async count(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    return await prisma.notification.count({ where });
  }

  /**
   * Verificar se já existe notificação para uma consulta
    @param {string} appointmentId - ID da consulta
    @param {string} type - Tipo da notificação
    @returns {Promise<Object|null>} - Notificação encontrada ou null
   */
  async findByAppointmentAndType(appointmentId, type) {
    return await prisma.notification.findFirst({
      where: {
        appointmentId,
        type,
      },
    });
  }

  /**
   * Deletar notificações antigas
    @param {number} daysOld - Dias atrás
    @returns {Promise<Object>} - Resultado da operação
   */
  async deleteOld(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        status: 'SENT',
      },
    });
  }

  /**
   * Retentar notificações falhas
    @param {number} maxRetries - Número máximo de tentativas
    @returns {Promise<Array>} - Lista de notificações para retentar
   */
  async findFailedForRetry(maxRetries = 3) {
    // Esta query seria melhor com um campo de contagem de tentativas
    // Por enquanto, retorna todas as falhas
    return await prisma.notification.findMany({
      where: {
        status: 'FAILED',
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
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
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}

module.exports = new NotificationRepository();