import api from './api'

export const patientsService = {
  // Listar todos os pacientes
  async getAll(params = {}) {
    try {
      const response = await api.get('/patients', { params })
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
      throw error
    }
  },

  // Buscar paciente por ID
  async getById(id) {
    try {
      const response = await api.get(`/patients/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar paciente:', error)
      throw error
    }
  },

  // Buscar paciente por CPF
  async getByCPF(cpf) {
    try {
      const response = await api.get('/patients', { 
        params: { cpf } 
      })
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar paciente por CPF:', error)
      throw error
    }
  },

  // Contar pacientes
  async count(params = {}) {
    try {
      const response = await api.get('/patients/count', { params })
      return response.data.data || 0
    } catch (error) {
      console.error('Erro ao contar pacientes:', error)
      throw error
    }
  },

  // Criar novo paciente
  async create(data) {
    try {
      const response = await api.post('/patients', data)
      return response.data.data
    } catch (error) {
      console.error('Erro ao criar paciente:', error)
      throw error
    }
  },

  // Atualizar paciente
  async update(id, data) {
    try {
      const response = await api.put(`/patients/${id}`, data)
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error)
      throw error
    }
  },

  // Atualizar email do paciente
  async updateEmail(id, newEmail) {
    try {
      const response = await api.put(`/patients/${id}/email`, { 
        email: newEmail 
      })
      return response.data.data
    } catch (error) {
      console.error('Erro ao atualizar email do paciente:', error)
      throw error
    }
  },

  // Ativar/Desativar paciente
  async toggleActive(id, isActive) {
    try {
      const response = await api.patch(`/patients/${id}/toggle-active`, { 
        isActive 
      })
      return response.data.data
    } catch (error) {
      console.error('Erro ao alterar status do paciente:', error)
      throw error
    }
  },

  // Deletar paciente
  async delete(id) {
    try {
      const response = await api.delete(`/patients/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao deletar paciente:', error)
      throw error
    }
  },

  // Buscar histórico de consultas do paciente
  async getAppointmentHistory(id, params = {}) {
    try {
      const response = await api.get(`/patients/${id}/appointments`, { 
        params 
      })
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar histórico de consultas:', error)
      throw error
    }
  },
}