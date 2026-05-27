import { useState, useEffect, useCallback } from 'react'
import { doctorsService } from '../services/doctorsService'

export function useDoctors() {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    specialty: '',
    isActive: true,
  })

const loadDoctors = useCallback(async () => {
  setIsLoading(true)
  setError(null)

  try {
    let result = []

      // Buscar dados base de acordo com os filtros
      if (filters.specialty) {
        // Se tem especialidade, buscar por especialidade
        result = await doctorsService.getBySpecialty(filters.specialty)
      } else {
        // Senão, buscar todos
        result = await doctorsService.getAll()
      }

      // SEMPRE aplicar filtro de status ativo SE estiver marcado
      if (filters.isActive) {
        result = result.filter(doctor => doctor.user?.isActive === true)
      }

      // Aplicar filtro de busca local (nome, CRM)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(doctor => 
          doctor.name?.toLowerCase().includes(searchLower) ||
          doctor.crm?.toLowerCase().includes(searchLower)
        )
      }

      setDoctors(result)
    } catch (err) {
      console.error('Erro ao carregar médicos:', err)
      setError(err.message || 'Erro ao carregar médicos')
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const loadSpecialties = useCallback(async () => {
    try {
      const result = await doctorsService.getSpecialties()
      setSpecialties(result)
    } catch (err) {
      console.error('Erro ao carregar especialidades:', err)
    }
  }, [])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  useEffect(() => {
    loadSpecialties()
  }, [loadSpecialties])

  const createDoctor = async (data) => {
    try {
      setError(null)
      const newDoctor = await doctorsService.create(data)
      await loadDoctors() // Recarregar lista
      return { success: true, data: newDoctor }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao criar médico'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateDoctor = async (id, data) => {
    try {
      setError(null)
      const updatedDoctor = await doctorsService.update(id, data)
      await loadDoctors() // Recarregar lista
      return { success: true, data: updatedDoctor }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao atualizar médico'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const toggleActive = async (id, isActive) => {
    try {
      setError(null)
      await doctorsService.toggleActive(id, isActive)
      await loadDoctors() // Recarregar lista
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao alterar status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const deleteDoctor = async (id) => {
    try {
      setError(null)
      await doctorsService.delete(id)
      await loadDoctors() // Recarregar lista
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao deletar médico'
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
      specialty: '',
      isActive: true,
    })
  }

  return {
    doctors,
    specialties,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    createDoctor,
    updateDoctor,
    toggleActive,
    deleteDoctor,
    refreshDoctors: loadDoctors,
  }
}