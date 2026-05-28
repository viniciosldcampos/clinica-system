import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import AppointmentsTable from '../components/appointments/AppointmentsTable'
import AppointmentFormModal from '../components/modals/AppointmentFormModal'
import AppointmentCancelModal from '../components/modals/AppointmentCancelModal'
import AppointmentDetailsModal from '../components/modals/AppointmentDetailsModal'
import { useAppointments } from '../hooks/useAppointments'
import { useAuth } from '../hooks/useAuth'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'AGENDADA', label: 'Agendada' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'REALIZADA', label: 'Realizada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

export default function Appointments() {
  const { user } = useAuth()
  const {
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
  } = useAppointments()

  // Estados dos modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handlers de filtros
  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value })
  }

  const handleStatusChange = (e) => {
    updateFilters({ status: e.target.value })
  }

  const handleDoctorChange = (e) => {
    updateFilters({ doctorId: e.target.value })
  }

  const handlePatientChange = (e) => {
    updateFilters({ patientId: e.target.value })
  }

  const handleDateFromChange = (e) => {
    updateFilters({ dateFrom: e.target.value })
  }

  const handleDateToChange = (e) => {
    updateFilters({ dateTo: e.target.value })
  }

  // Handler de criar consulta
  const handleCreateClick = () => {
    setSelectedAppointment(null)
    setIsFormModalOpen(true)
  }

  // Handler de editar/reagendar consulta
  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment)
    setIsFormModalOpen(true)
  }

  // Handler de cancelar consulta
  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment)
    setIsCancelModalOpen(true)
  }

  // Handler de ver detalhes
  const handleViewDetailsClick = (appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  // Handler de atualizar status
  const handleUpdateStatusClick = async (appointment, newStatus) => {
    setIsSubmitting(true)

    try {
      const result = await updateStatus(appointment.id, newStatus)

      if (result.success) {
        setIsDetailsModalOpen(false)
        setSelectedAppointment(null)
      } else {
        alert(result.error || 'Erro ao atualizar status')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit do formulário
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      let result

      if (selectedAppointment) {
        // Editar/Reagendar
        result = await updateAppointment(selectedAppointment.id, data)
      } else {
        // Criar
        result = await createAppointment(data)
      }

      if (result.success) {
        setIsFormModalOpen(false)
        setSelectedAppointment(null)
      } else {
        alert(result.error || 'Erro ao salvar consulta')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit do cancelamento
  const handleCancelSubmit = async (reason) => {
    if (!selectedAppointment) return

    setIsSubmitting(true)

    try {
      const result = await cancelAppointment(selectedAppointment.id, reason)

      if (result.success) {
        setIsCancelModalOpen(false)
        setSelectedAppointment(null)
      } else {
        alert(result.error || 'Erro ao cancelar consulta')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      title="Consultas"
      subtitle="Gerencie as consultas da clínica."
      user={{
        name: user?.email || 'Usuário',
        role: user?.role || 'N/A',
        initials: user?.email?.substring(0, 2).toUpperCase() || 'U'
      }}
      notificationCount={3}
    >
      <Card>
        <CardHeader>
          <CardTitle subtitle="Visualize e gerencie todas as consultas cadastradas.">
            Lista de Consultas
          </CardTitle>
          {user?.role !== 'DOCTOR' && (
            <Button variant="primary" onClick={handleCreateClick}>
              ➕ Agendar Consulta
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="filters-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Busca */}
              <Input
                type="search"
                placeholder="Buscar por paciente ou médico..."
                value={filters.search}
                onChange={handleSearchChange}
              />

              {/* Status */}
              <select
                value={filters.status}
                onChange={handleStatusChange}
                style={{
                  height: '56px',
                  padding: '0 20px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  fontSize: '16px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Médico */}
              {(user?.role === 'ADMIN' || user?.role === 'PATIENT') && (
                <select
                  value={filters.doctorId}
                  onChange={handleDoctorChange}
                  style={{
                    height: '56px',
                    padding: '0 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    fontSize: '16px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Todos médicos</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Paciente */}
              {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
                <select
                  value={filters.patientId}
                  onChange={handlePatientChange}
                  style={{
                    height: '56px',
                    padding: '0 20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    fontSize: '16px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Todos pacientes</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Data De */}
              <Input
                type="date"
                label="De:"
                value={filters.dateFrom}
                onChange={handleDateFromChange}
                placeholder="Data inicial"
              />

              {/* Data Até */}
              <Input
                type="date"
                label="Até:"
                value={filters.dateTo}
                onChange={handleDateToChange}
                placeholder="Data final"
              />
            </div>

            {/* Botão de limpar filtros */}
            {(filters.search || filters.status || filters.doctorId || filters.patientId || filters.dateFrom || filters.dateTo) && (
              <Button variant="ghost" onClick={clearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Mensagem de erro */}
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

          {/* Tabela */}
          <AppointmentsTable
            appointments={appointments}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onCancel={handleCancelClick}
            onViewDetails={handleViewDetailsClick}
            onUpdateStatus={handleUpdateStatusClick}
          />

          {/* Total de consultas */}
          {!isLoading && appointments.length > 0 && (
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#64748b',
              textAlign: 'right'
            }}>
              Total: {appointments.length} consulta{appointments.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <AppointmentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedAppointment(null)
        }}
        onSubmit={handleFormSubmit}
        appointment={selectedAppointment}
        doctors={doctors}
        patients={patients}
        isLoading={isSubmitting}
        userRole={user?.role || 'PATIENT'}
        currentUserId={user?.id}
      />

      {/* Modal de Cancelamento */}
      <AppointmentCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false)
          setSelectedAppointment(null)
        }}
        onConfirm={handleCancelSubmit}
        appointment={selectedAppointment}
        isLoading={isSubmitting}
      />

      {/* Modal de Detalhes */}
      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        onEdit={handleEditClick}
        onCancel={handleCancelClick}
        onUpdateStatus={handleUpdateStatusClick}
        userRole={user?.role || 'PATIENT'}
      />
    </DashboardLayout>
  )
}