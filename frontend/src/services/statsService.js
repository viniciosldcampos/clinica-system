import api from './api'

export const statsService = {
  async getDashboardStats() {
    try {
      const response = await api.get('/stats')
      return response.data.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  },

  async getRecentAppointments(limit = 5) {
    try {
      const response = await api.get('/appointments')
      const all = response.data.data || []
      return all
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
        .slice(0, limit)
    } catch (error) {
      console.error('Erro ao buscar consultas recentes:', error)
      throw error
    }
  },
}