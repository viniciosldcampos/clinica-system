import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PatientsTable from '../components/patients/PatientsTable'
import PatientFormModal from '../components/modals/PatientFormModal'
import ConfirmModal from '../components/modals/ConfirmModal'
import { usePatients } from '../hooks/usePatients'
import { useAuth } from '../hooks/useAuth'

export default function Patients() {
  const { user } = useAuth()
  const {
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
  } = usePatients()

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value })
  }

  const handleActiveFilterChange = (e) => {
    updateFilters({ isActive: e.target.checked })
  }

  const handleCreateClick = () => {
    setSelectedPatient(null)
    setIsFormModalOpen(true)
  }

  const handleEditClick = (patient) => {
    setSelectedPatient(patient)
    setIsFormModalOpen(true)
  }

  const handleToggleActiveClick = (patient) => {
    setSelectedPatient(patient)
    setConfirmAction('toggle')
    setIsConfirmModalOpen(true)
  }

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient)
    setConfirmAction('delete')
    setIsConfirmModalOpen(true)
  }

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      let result

      if (selectedPatient) {
        result = await updatePatient(selectedPatient.id, data)
      } else {
        result = await createPatient(data)
      }

      if (result.success) {
        setIsFormModalOpen(false)
        setSelectedPatient(null)
      } else {
        alert(result.error || 'Erro ao salvar paciente')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmAction = async () => {
    if (!selectedPatient) return

    setIsSubmitting(true)

    try {
      let result

      if (confirmAction === 'toggle') {
        result = await toggleActive(selectedPatient.id, !selectedPatient.isActive)
      } else if (confirmAction === 'delete') {
        result = await deletePatient(selectedPatient.id)
      }

      if (result.success) {
        setIsConfirmModalOpen(false)
        setSelectedPatient(null)
        setConfirmAction(null)
      } else {
        alert(result.error || 'Erro ao executar ação')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      title="Pacientes"
      subtitle="Gerencie os pacientes da clínica."
      user={{
        name: user?.email || 'Usuário',
        role: user?.role || 'N/A',
        initials: user?.email?.substring(0, 2).toUpperCase() || 'U'
      }}
      notificationCount={3}
    >
      <Card>
        <CardHeader>
          <CardTitle subtitle="Visualize e gerencie todos os pacientes cadastrados.">
            Lista de Pacientes
          </CardTitle>
          <Button variant="primary" onClick={handleCreateClick}>
            ➕ Novo Paciente
          </Button>
        </CardHeader>

        <CardContent>
          <div className="filters-section" style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'flex-end'
          }}>
            <Input
              type="search"
              placeholder="Buscar por nome, CPF ou email..."
              value={filters.search}
              onChange={handleSearchChange}
            />

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              color: '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
              <input
                type="checkbox"
                checked={filters.isActive}
                onChange={handleActiveFilterChange}
                style={{ cursor: 'pointer' }}
              />
              Apenas ativos
            </label>

            {(filters.search || !filters.isActive) && (
              <Button variant="ghost" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '18px',
              padding: '16px',
              marginBottom: '24px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          <PatientsTable
            patients={patients}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onToggleActive={handleToggleActiveClick}
          />

          {!isLoading && patients.length > 0 && (
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#64748b',
              textAlign: 'right'
            }}>
              Total: {patients.length} paciente{patients.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedPatient(null)
        }}
        onSubmit={handleFormSubmit}
        patient={selectedPatient}
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setSelectedPatient(null)
          setConfirmAction(null)
        }}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === 'delete'
            ? 'Deletar Paciente'
            : selectedPatient?.isActive
              ? 'Desativar Paciente'
              : 'Ativar Paciente'
        }
        message={
          confirmAction === 'delete'
            ? `Tem certeza que deseja deletar o paciente ${selectedPatient?.name}? Esta ação não pode ser desfeita.`
            : selectedPatient?.isActive
              ? `Desativar o paciente ${selectedPatient?.name}? Ele não poderá mais agendar consultas.`
              : `Ativar o paciente ${selectedPatient?.name}? Ele poderá agendar consultas novamente.`
        }
        confirmText={confirmAction === 'delete' ? 'Sim, deletar' : 'Confirmar'}
        variant={confirmAction === 'delete' ? 'danger' : 'warning'}
        isLoading={isSubmitting}
      />
    </DashboardLayout>
  )
}
