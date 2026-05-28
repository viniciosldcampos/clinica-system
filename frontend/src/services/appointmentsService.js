import api from './api'

export const appointmentsService = {
  // Listar todas as consultas
  async getAll(params = {}) {
    try {
      const response = await api.get('/appointments', { params })
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar consultas:', error)
      throw error
    }
  },

  // Buscar minhas consultas
  async getMy(params = {}) {
    try {
      const response = await api.get('/appointments/my', { params })
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar minhas consultas:', error)
      throw error
    }
  },

  // Buscar consultas futuras
  async getUpcoming(params = {}) {
    try {
      const response = await api.get('/appointments/upcoming', { params })
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar consultas futuras:', error)
      throw error
    }
  },

  // Buscar consulta por ID
  async getById(id) {
    try {
      const response = await api.get(`/appointments/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar consulta:', error)
      throw error
    }
  },

  // Contar consultas
  async count(params = {}) {
    try {
      const response = await api.get('/appointments/count', { params })
      return response.data.data || 0
    } catch (error) {
      console.error('Erro ao contar consultas:', error)
      throw error
    }
  },

  // Criar nova consulta
  async create(data) {
    try {
      const response = await api.post('/appointments', data)
      return response.data.data
    } catch (error) {
      console.error('Erro ao criar consulta:', error)
      throw error
    }
  },

  // Atualizar/Reagendar consulta
  async update(id, data) {
    try {
      const response = await api.put(`/appointments/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error)
      throw error
    }
  },

  // Cancelar consulta
  async cancel(id, reason = '') {
    try {
      const response = await api.patch(`/appointments/${id}/cancel`, { 
        reason 
      })
      return response.data.data
    } catch (error) {
      console.error('Erro ao cancelar consulta:', error)
      throw error
    }
  },

  // Atualizar status da consulta (DOCTOR/ADMIN)
  async updateStatus(id, status) {
    try {
      const response = await api.patch(`/appointments/${id}/status`, { 
        status 
      })
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  },

  // Deletar consulta (ADMIN)
  async delete(id) {
    try {
      const response = await api.delete(`/appointments/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao deletar consulta:', error)
      throw error
    }
  },
}