import { useState, useEffect, useCallback } from 'react'
import { statsService } from '../services/statsService'

export function useDashboard() {
  const [metrics, setMetrics] = useState([])
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMockData = useCallback(() => {
    // Dados de fallback em caso de erro
    setMetrics([
      {
        title: 'Consultas Hoje',
        value: '0',
        trend: 'Sem dados',
        icon: '📅'
      },
      {
        title: 'Pacientes Ativos',
        value: '0',
        trend: 'Sem dados',
        icon: '🧑'
      },
      {
        title: 'Médicos Online',
        value: '0',
        trend: 'Sem dados',
        icon: '👨‍⚕️'
      },
      {
        title: 'Faturamento',
        value: 'R$ 0',
        trend: 'Sem dados',
        icon: '💰'
      },
    ])

    setAppointments([])
    setNotifications([])
  }, [])

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return timeString
    }
  }

  const formatStatus = (status) => {
    const statusMap = {
      'AGENDADA': 'Agendada',
      'CONFIRMADA': 'Confirmada',
      'REALIZADA': 'Realizada',
      'CANCELADA': 'Cancelada',
      'FALTOU': 'Faltou',
    }
    
    return statusMap[status] || status
  }

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Buscar dados reais da API
      const [stats, recentAppointments] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getRecentAppointments(5),
      ])

      // Montar métricas
      setMetrics([
        {
          title: 'Consultas Hoje',
          value: stats.appointmentsToday.toString(),
          trend: '+12% este mês',
          icon: '📅'
        },
        {
          title: 'Pacientes Ativos',
          value: stats.activePatients.toString(),
          trend: '+18% este mês',
          icon: '🧑'
        },
        {
          title: 'Médicos Online',
          value: stats.onlineDoctors.toString(),
          trend: 'Sistema operando normalmente',
          icon: '👨‍⚕️'
        },
        {
          title: 'Faturamento',
          value: stats.revenue,
          trend: '+9% este mês',
          icon: '💰'
        },
      ])

      // Formatar consultas para exibição
      const formattedAppointments = recentAppointments.map(apt => ({
        patient: apt.patient?.name || 'N/A',
        doctor: apt.doctor?.name || 'N/A',
        specialty: apt.doctor?.specialty || 'N/A',
        time: apt.appointmentTime ? formatTime(apt.appointmentTime) : 'N/A',
        status: formatStatus(apt.status),
      }))

      setAppointments(formattedAppointments)

      // Notificações mockadas (TODO: implementar no backend)
      setNotifications([
        {
          title: 'Nova consulta agendada',
          description: 'Uma nova consulta foi agendada para hoje.',
          time: '5 min atrás'
        },
        {
          title: 'Sistema atualizado',
          description: 'O sistema foi atualizado com sucesso.',
          time: '1h atrás'
        },
      ])

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError(err.message || 'Erro ao carregar dados do dashboard')
      
      // Em caso de erro, carregar dados mockados
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }, [loadMockData])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const refreshData = () => {
    loadDashboardData()
  }

  return {
    metrics,
    appointments,
    notifications,
    isLoading,
    error,
    refreshData,
  }
}