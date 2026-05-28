import { useState, useEffect, useCallback } from 'react'
import { appointmentsService } from '../services/appointmentsService'
import { doctorsService } from '../services/doctorsService'
import { patientsService } from '../services/patientsService'

export function useAppointments() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    doctorId: '',
    patientId: '',
    dateFrom: '',
    dateTo: '',
  })

  const loadAppointments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let result = await appointmentsService.getAll()

      // Aplicar filtro de status
      if (filters.status) {
        result = result.filter(apt => apt.status === filters.status)
      }

      // Aplicar filtro de médico
      if (filters.doctorId) {
        result = result.filter(apt => apt.doctorId === filters.doctorId)
      }

      // Aplicar filtro de paciente
      if (filters.patientId) {
        result = result.filter(apt => apt.patientId === filters.patientId)
      }

      // Aplicar filtro de data (de)
      if (filters.dateFrom) {
        result = result.filter(apt => {
          const aptDate = new Date(apt.appointmentDate)
          const fromDate = new Date(filters.dateFrom)
          return aptDate >= fromDate
        })
      }

      // Aplicar filtro de data (até)
      if (filters.dateTo) {
        result = result.filter(apt => {
          const aptDate = new Date(apt.appointmentDate)
          const toDate = new Date(filters.dateTo)
          toDate.setHours(23, 59, 59, 999)
          return aptDate <= toDate
        })
      }

      // Aplicar filtro de busca (nome paciente, médico)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(apt =>
          apt.patient?.name?.toLowerCase().includes(searchLower) ||
          apt.doctor?.name?.toLowerCase().includes(searchLower)
        )
      }

      // Ordenar por data descendente
      result.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))

      setAppointments(result)
    } catch (err) {
      console.error('Erro ao carregar consultas:', err)
      setError(err.message || 'Erro ao carregar consultas')
      setAppointments([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const loadDoctors = useCallback(async () => {
    try {
      const result = await doctorsService.getActive()
      setDoctors(result)
    } catch (err) {
      console.error('Erro ao carregar médicos:', err)
    }
  }, [])

  const loadPatients = useCallback(async () => {
    try {
      const result = await patientsService.getAll()
      setPatients(result)
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    loadDoctors()
    loadPatients()
  }, [loadDoctors, loadPatients])

  const createAppointment = async (data) => {
  try {
    setError(null)
    console.log('📤 Criando consulta:', data)
    
    const newAppointment = await appointmentsService.create(data)
    
    console.log('✅ Consulta criada:', newAppointment)
    
    await loadAppointments()
    return { success: true, data: newAppointment }
  } catch (err) {
    console.error('❌ Erro ao criar consulta:', err)
    console.error('❌ Status:', err.response?.status)
    console.error('❌ Dados da resposta:', err.response?.data)
    console.error('❌ Mensagem:', err.response?.data?.message)
    
    const errorMessage = err.response?.data?.message || err.message || 'Erro ao criar consulta'
    setError(errorMessage)
    return { success: false, error: errorMessage }
  }
}

  const updateAppointment = async (id, data) => {
    try {
      setError(null)
      const updatedAppointment = await appointmentsService.update(id, data)
      await loadAppointments()
      return { success: true, data: updatedAppointment }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar consulta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const cancelAppointment = async (id, reason = '') => {
    try {
      setError(null)
      await appointmentsService.cancel(id, reason)
      await loadAppointments()
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao cancelar consulta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateStatus = async (id, status) => {
    try {
      setError(null)
      await appointmentsService.updateStatus(id, status)
      await loadAppointments()
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteAppointment = async (id) => {
    try {
      setError(null)
      await appointmentsService.delete(id)
      await loadAppointments()
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao deletar consulta'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      doctorId: '',
      patientId: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  return {
    appointments,
    doctors,
    patients,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    updateStatus,
    deleteAppointment,
    refreshAppointments: loadAppointments,
  }
}