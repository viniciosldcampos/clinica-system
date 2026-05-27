import { useState, useEffect, useCallback } from 'react'
import { patientsService } from '../services/patientsService'

export function usePatients() {
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    isActive: true,
  })

  const loadPatients = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let result = []

      // Buscar todos os pacientes
      result = await patientsService.getAll()

      // Aplicar filtro de status ativo (se checkbox marcado)
      if (filters.isActive) {
        result = result.filter(patient => patient.user?.isActive === true)
      }

      // Aplicar filtro de busca local (nome, CPF, email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(patient => 
          patient.name?.toLowerCase().includes(searchLower) ||
          patient.cpf?.includes(filters.search) ||
          patient.user?.email?.toLowerCase().includes(searchLower)
        )
      }

      setPatients(result)
    } catch (err) {
      console.error('Erro ao carregar pacientes:', err)
      setError(err.message || 'Erro ao carregar pacientes')
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

const createPatient = async (data) => {
  try {
    setError(null)
    console.log('📤 Enviando dados para criar paciente:', data) // <--- LOG
    
    const newPatient = await patientsService.create(data)
    
    console.log('✅ Paciente criado:', newPatient) // <--- LOG
    
    await loadPatients() // Recarregar lista
    return { success: true, data: newPatient }
  } catch (err) {
    console.error('❌ Erro ao criar paciente:', err) // <--- LOG
    console.error('❌ Detalhes do erro:', err.response?.data) // <--- LOG DETALHES
    
    const errorMessage = err.response?.data?.message || err.message || 'Erro ao criar paciente'
    setError(errorMessage)
    return { success: false, error: errorMessage }
  }
}

  const updatePatient = async (id, data) => {
    try {
      setError(null)
      const updatedPatient = await patientsService.update(id, data)
      await loadPatients() // Recarregar lista
      return { success: true, data: updatedPatient }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar paciente'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      setError(null)
      await patientsService.toggleActive(id, isActive)
      await loadPatients() // Recarregar lista
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao alterar status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deletePatient = async (id) => {
    try {
      setError(null)
      await patientsService.delete(id)
      await loadPatients() // Recarregar lista
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao deletar paciente'
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
      isActive: true,
    })
  }

  return {
    patients,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    createPatient,
    updatePatient,
    toggleActive,
    deletePatient,
    refreshPatients: loadPatients,
  }
}