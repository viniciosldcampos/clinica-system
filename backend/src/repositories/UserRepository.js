const prisma = require('../config/database');

class UserRepository {
  /**
    Criar um novo usuário
    @param {Object} data - Dados do usuário
    @returns {Promise<Object>} - Usuário criado
   */
  async create(data) {
    return await prisma.user.create({
      data,
    });
  }

  /**
    Buscar usuário por ID
    @param {string} id - ID do usuário
    @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  /**
    Buscar usuário por email
    @param {string} email - Email do usuário
    @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true,
      },
    });
  }

  /**
    Listar todos os usuários
    @param {Object} filters - Filtros opcionais
    @returns {Promise<Array>} - Lista de usuários
   */
  async findAll(filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await prisma.user.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
    Atualizar usuário
    @param {string} id - ID do usuário
    @param {Object} data - Dados a atualizar
    @returns {Promise<Object>} - Usuário atualizado
   */
  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
    Deletar usuário
    @param {string} id - ID do usuário
    @returns {Promise<Object>} - Usuário deletado
   */
  async delete(id) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  /**
    Ativar/Desativar usuário
    @param {string} id - ID do usuário
    @param {boolean} isActive - Status
    @returns {Promise<Object>} - Usuário atualizado
   */
  async toggleActive(id, isActive) {
    return await prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
    Contar usuários
    @param {Object} filters - Filtros opcionais
    @returns {Promise<number>} - Quantidade de usuários
   */
  async count(filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return await prisma.user.count({ where });
  }
}

module.exports = new UserRepository();