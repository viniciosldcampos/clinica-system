import { useState, useEffect, useCallback } from 'react'
import { statsService } from '../services/statsService'
import appointmentsIcon from '../icons/appointments.png'
import patientIcon from '../icons/patientIcon.png'
import doctorIcon from '../icons/doctorIcon.png'
import moneyIcon from '../icons/moneyIcon.png'

export function useDashboard() {
  const [metrics, setMetrics] = useState([])
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMockData = useCallback(() => {
    setMetrics([
      { title: 'Consultas Hoje', value: '—', trend: 'Sem dados', icon: appointmentsIcon },
      { title: 'Pacientes Ativos', value: '—', trend: 'Sem dados', icon: patientIcon },
      { title: 'Médicos Ativos', value: '—', trend: 'Sem dados', icon: doctorIcon },
      { title: 'Consultas Realizadas', value: '—', trend: 'Sem dados', icon: moneyIcon },
    ])
    setAppointments([])
    setNotifications([])
  }, [])

  const formatStatus = (status) => {
    const statusMap = {
      AGENDADA: 'Agendada',
      CONFIRMADA: 'Confirmada',
      REALIZADA: 'Realizada',
      CANCELADA: 'Cancelada',
      FALTOU: 'Faltou',
    }
    return statusMap[status] || status
  }

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [stats, recentAppointments] = await Promise.all([
        statsService.getDashboardStats(),
        statsService.getRecentAppointments(5),
      ])

      setMetrics([
        {
          title: 'Consultas Hoje',
          value: stats.appointmentsToday.toString(),
          trend: `${stats.totalAppointments} realizadas no total`,
          icon: appointmentsIcon,
        },
        {
          title: 'Pacientes Ativos',
          value: stats.activePatients.toString(),
          trend: 'pacientes cadastrados',
          icon: patientIcon,
        },
        {
          title: 'Médicos Ativos',
          value: stats.activeDoctors.toString(),
          trend: 'médicos disponíveis',
          icon: doctorIcon,
        },
        {
          title: 'Consultas Realizadas',
          value: stats.totalAppointments.toString(),
          trend: 'histórico total',
          icon: moneyIcon,
        },
      ])

      const formattedAppointments = recentAppointments.map(apt => ({
        patient: apt.patient?.name || 'N/A',
        doctor: apt.doctor?.name || 'N/A',
        specialty: apt.doctor?.specialty || 'N/A',
        time: apt.appointmentDate
          ? new Date(apt.appointmentDate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A',
        status: formatStatus(apt.status),
      }))

      setAppointments(formattedAppointments)
      setNotifications([])

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError(err.message || 'Erro ao carregar dados do dashboard')
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }, [loadMockData])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    metrics,
    appointments,
    notifications,
    isLoading,
    error,
    refreshData: loadDashboardData,
  }
}