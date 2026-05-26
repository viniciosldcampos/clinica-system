import api from './api'

export const statsService = {
  // Buscar estatísticas gerais do dashboard
  async getDashboardStats() {
    try {
      // Por enquanto vamos buscar dados das diferentes APIs
      // e montar as estatísticas
      
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        api.get('/appointments/count'),
        api.get('/patients'),
        api.get('/doctors/active'),
      ])

      const appointmentsCount = appointmentsRes.data.data?.count || 0
      const patientsCount = patientsRes.data.data?.length || 0
      const doctorsCount = doctorsRes.data.data?.length || 0

      return {
        appointmentsToday: appointmentsCount,
        activePatients: patientsCount,
        onlineDoctors: doctorsCount,
        revenue: 'R$ 84k', // TODO: Implementar no backend
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw error
    }
  },

  // Buscar consultas recentes
  async getRecentAppointments(limit = 10) {
    try {
      const response = await api.get('/appointments', {
        params: { limit }
      })
      
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar consultas:', error)
      throw error
    }
  },

  // Buscar consultas futuras
  async getUpcomingAppointments() {
    try {
      const response = await api.get('/appointments/upcoming')
      
      return response.data.data || []
    } catch (error) {
      console.error('Erro ao buscar consultas futuras:', error)
      throw error
    }
  },
}