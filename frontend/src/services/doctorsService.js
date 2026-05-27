import api from './api'

export const doctorsService = {
  // Listar todos os médicos
  async getAll(params = {}) {
    try {
      const response = await api.get('/doctors', { params })
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar médicos:', error)
      throw error
    }
  },

  // Listar apenas médicos ativos
  async getActive() {
    try {
      const response = await api.get('/doctors/active')
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar médicos ativos:', error)
      throw error
    }
  },

  // Buscar médico por ID
  async getById(id) {
    try {
      const response = await api.get(`/doctors/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar médico:', error)
      throw error
    }
  },

  // Buscar especialidades únicas
  async getSpecialties() {
    try {
      const response = await api.get('/doctors/specialties')
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error)
      throw error
    }
  },

  // Buscar médicos por especialidade
  async getBySpecialty(specialty) {
    try {
      const response = await api.get(`/doctors/specialty/${specialty}`)
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar médicos por especialidade:', error)
      throw error
    }
  },

  // Criar novo médico
  async create(data) {
    try {
      const response = await api.post('/doctors', data)
      return response.data.data
    } catch (error) {
      console.error('Erro ao criar médico:', error)
      throw error
    }
  },

  // Atualizar médico
  async update(id, data) {
    try {
      const response = await api.put(`/doctors/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar médico:', error)
      throw error
    }
  },

  // Ativar/Desativar médico
  async toggleActive(id, isActive) {
    try {
      const response = await api.patch(`/doctors/${id}/toggle-active`, { isActive })
      return response.data.data
    } catch (error) {
      console.error('Erro ao alterar status do médico:', error)
      throw error
    }
  },

  // Deletar médico
  async delete(id) {
    try {
      const response = await api.delete(`/doctors/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao deletar médico:', error)
      throw error
    }
  },
}