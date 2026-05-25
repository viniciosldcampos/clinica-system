import { useState, useEffect } from 'react'

export function useDashboard() {
  const [metrics, setMetrics] = useState([])
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Por enquanto, dados mockados
      // TODO: Integrar com API real
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay

      setMetrics([
        {
          title: 'Consultas Hoje',
          value: '128',
          trend: '+12% este mês',
          icon: '📅'
        },
        {
          title: 'Pacientes Ativos',
          value: '1.842',
          trend: '+18% este mês',
          icon: '🧑'
        },
        {
          title: 'Médicos Online',
          value: '36',
          trend: 'Sistema operando normalmente',
          icon: '👨‍⚕️'
        },
        {
          title: 'Faturamento',
          value: 'R$ 84k',
          trend: '+9% este mês',
          icon: '💰'
        },
      ])

      setAppointments([
        {
          patient: 'Maria Oliveira',
          doctor: 'Dr. Ricardo Alves',
          specialty: 'Cardiologia',
          time: '09:30',
          status: 'Confirmada',
        },
        {
          patient: 'João Pedro',
          doctor: 'Dra. Camila Rocha',
          specialty: 'Dermatologia',
          time: '10:00',
          status: 'Em andamento',
        },
        {
          patient: 'Fernanda Lima',
          doctor: 'Dr. Marcelo Costa',
          specialty: 'Ortopedia',
          time: '11:20',
          status: 'Pendente',
        },
      ])

      setNotifications([
        {
          title: 'Nova consulta agendada',
          description: 'Fernanda Lima agendou consulta para hoje às 14:00.',
          time: '5 min atrás'
        },
        {
          title: 'Atendimento finalizado',
          description: 'Consulta de João Pedro foi concluída com sucesso.',
          time: '15 min atrás'
        },
        {
          title: 'Reagendamento solicitado',
          description: 'Maria Oliveira solicitou alteração de horário.',
          time: '1h atrás'
        },
      ])
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setIsLoading(false)
    }
  }

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