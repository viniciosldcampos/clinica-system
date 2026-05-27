import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import DoctorsTable from '../components/doctors/DoctorsTable'
import DoctorFormModal from '../components/modals/DoctorFormModal'
import ConfirmModal from '../components/modals/ConfirmModal'
import { useDoctors } from '../hooks/useDoctors'
import { useAuth } from '../hooks/useAuth'

export default function Doctors() {
  const { user } = useAuth()
  const {
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
  } = useDoctors()

  // Estados dos modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handlers de filtros
  const handleSearchChange = (e) => {
    updateFilters({ search: e.target.value })
  }

  const handleSpecialtyChange = (e) => {
    updateFilters({ specialty: e.target.value })
  }

  const handleActiveFilterChange = (e) => {
    updateFilters({ isActive: e.target.checked })
  }

  // Handler de criar médico
  const handleCreateClick = () => {
    setSelectedDoctor(null)
    setIsFormModalOpen(true)
  }

  // Handler de editar médico
  const handleEditClick = (doctor) => {
    setSelectedDoctor(doctor)
    setIsFormModalOpen(true)
  }

  // Handler de ativar/desativar médico
  const handleToggleActiveClick = (doctor) => {
    setSelectedDoctor(doctor)
    setConfirmAction('toggle')
    setIsConfirmModalOpen(true)
  }

  // Handler de deletar médico
  const handleDeleteClick = (doctor) => {
    setSelectedDoctor(doctor)
    setConfirmAction('delete')
    setIsConfirmModalOpen(true)
  }

  // Submit do formulário
  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      let result

      if (selectedDoctor) {
        // Editar
        result = await updateDoctor(selectedDoctor.id, data)
      } else {
        // Criar
        result = await createDoctor(data)
      }

      if (result.success) {
        setIsFormModalOpen(false)
        setSelectedDoctor(null)
      } else {
        alert(result.error || 'Erro ao salvar médico')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirmar ação
  const handleConfirmAction = async () => {
    if (!selectedDoctor) return

    setIsSubmitting(true)

    try {
      let result

      if (confirmAction === 'toggle') {
        result = await toggleActive(selectedDoctor.id, !selectedDoctor.user?.isActive)
      } else if (confirmAction === 'delete') {
        result = await deleteDoctor(selectedDoctor.id)
      }

      if (result.success) {
        setIsConfirmModalOpen(false)
        setSelectedDoctor(null)
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
      title="Médicos"
      subtitle="Gerencie os médicos da clínica."
      user={{
        name: user?.email || 'Usuário',
        role: user?.role || 'N/A',
        initials: user?.email?.substring(0, 2).toUpperCase() || 'U'
      }}
      notificationCount={3}
    >
      <Card>
        <CardHeader>
          <CardTitle subtitle="Visualize e gerencie todos os médicos cadastrados.">
            Lista de Médicos
          </CardTitle>
          <Button variant="primary" onClick={handleCreateClick}>
            ➕ Novo Médico
          </Button>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="filters-section" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 200px auto',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Busca */}
            <Input
              type="search"
              placeholder="Buscar por nome ou CRM..."
              value={filters.search}
              onChange={handleSearchChange}
            />

            {/* Filtro de Especialidade */}
            <select
              value={filters.specialty}
              onChange={handleSpecialtyChange}
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
              <option value="">Todas especialidades</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* Filtro de Ativos */}
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

            {/* Botão de limpar filtros */}
            {(filters.search || filters.specialty || !filters.isActive) && (
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
          <DoctorsTable
            doctors={doctors}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onToggleActive={handleToggleActiveClick}
          />

          {/* Total de médicos */}
          {!isLoading && doctors.length > 0 && (
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#64748b',
              textAlign: 'right'
            }}>
              Total: {doctors.length} médico{doctors.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Formulário */}
      <DoctorFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedDoctor(null)
        }}
        onSubmit={handleFormSubmit}
        doctor={selectedDoctor}
        isLoading={isSubmitting}
      />

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false)
          setSelectedDoctor(null)
          setConfirmAction(null)
        }}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === 'delete'
            ? 'Deletar Médico'
            : selectedDoctor?.isActive
              ? 'Desativar Médico'
              : 'Ativar Médico'
        }
        message={
          confirmAction === 'delete'
            ? `Tem certeza que deseja deletar o médico ${selectedDoctor?.name}? Esta ação não pode ser desfeita.`
            : selectedDoctor?.user?.isActive  // <--- MUDANÇA AQUI
              ? `Desativar o médico ${selectedDoctor?.name}? Ele não poderá mais receber consultas.`
              : `Ativar o médico ${selectedDoctor?.name}? Ele poderá receber consultas novamente.`
        }
        confirmText={confirmAction === 'delete' ? 'Sim, deletar' : 'Confirmar'}
        variant={confirmAction === 'delete' ? 'danger' : 'warning'}
        isLoading={isSubmitting}
      />
    </DashboardLayout>
  )
}