import Badge from '../ui/Badge'
import Button from '../ui/Button'
import './AppointmentDetailsModal.css'

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment = null,
  onEdit,
  onCancel,
  onUpdateStatus,
  userRole = 'PATIENT',
}) {
  if (!isOpen || !appointment) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const isAgendada = appointment.status === 'AGENDADA'
  const isConfirmada = appointment.status === 'CONFIRMADA'
  const isCancelada = appointment.status === 'CANCELADA'
  const isRealizada = appointment.status === 'REALIZADA'

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
    >
      <div className="modal-content details-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 id="details-modal-title">
            📋 Detalhes da Consulta
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className="details-content">
          {/* Status */}
          <div className="status-section">
            <StatusBadge status={appointment.status} />
          </div>

          {/* Paciente */}
          <div className="detail-section">
            <h3>Informações do Paciente</h3>
            <div className="patient-card">
              <div className="avatar">
                {appointment.patient?.name?.charAt(0) || 'P'}
              </div>
              <div className="info">
                <div className="name">{appointment.patient?.name}</div>
                <div className="detail-row">
                  <span className="label">CPF:</span>
                  <span className="value">{formatCPF(appointment.patient?.cpf)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Telefone:</span>
                  <span className="value">{formatPhone(appointment.patient?.phone)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{appointment.patient?.user?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Médico */}
          <div className="detail-section">
            <h3>Informações do Médico</h3>
            <div className="doctor-card">
              <div className="avatar">
                {appointment.doctor?.name?.charAt(0) || 'D'}
              </div>
              <div className="info">
                <div className="name">{appointment.doctor?.name}</div>
                <div className="detail-row">
                  <span className="label">CRM:</span>
                  <span className="value">{appointment.doctor?.crm}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Especialidade:</span>
                  <span className="value">{appointment.doctor?.specialty}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Telefone:</span>
                  <span className="value">{formatPhone(appointment.doctor?.phone)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data e Hora */}
          <div className="detail-section">
            <h3>Data e Hora</h3>
            <div className="detail-box">
              <div className="detail-row">
                <span className="label">Data:</span>
                <span className="value">
                  {new Date(appointment.appointmentDate).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Hora:</span>
                <span className="value">
                  {new Date(appointment.appointmentDate).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Duração:</span>
                <span className="value">30 minutos</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {appointment.notes && (
            <div className="detail-section">
              <h3>Observações</h3>
              <div className="notes-box">
                {appointment.notes}
              </div>
            </div>
          )}

          {/* Motivo do cancelamento */}
          {isCancelada && appointment.cancelReason && (
            <div className="detail-section">
              <h3>Motivo do Cancelamento</h3>
              <div className="cancel-reason-box">
                {appointment.cancelReason}
              </div>
            </div>
          )}

          {/* Data de criação */}
          <div className="detail-section">
            <h3>Informações Gerais</h3>
            <div className="detail-box">
              <div className="detail-row">
                <span className="label">Criado em:</span>
                <span className="value">
                  {new Date(appointment.createdAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(appointment.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Atualizado em:</span>
                <span className="value">
                  {new Date(appointment.updatedAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(appointment.updatedAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="modal-footer">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>

          {/* Botão Reagendar - apenas se agendada */}
          {isAgendada && userRole !== 'DOCTOR' && (
            <Button
              variant="primary"
              onClick={() => {
                onEdit(appointment)
                onClose()
              }}
            >
              ✏️ Reagendar
            </Button>
          )}

          {/* Botão Cancelar - apenas se agendada ou confirmada */}
          {(isAgendada || isConfirmada) && (
            <Button
              variant="primary"
              onClick={() => {
                onCancel(appointment)
                onClose()
              }}
            >
              ❌ Cancelar
            </Button>
          )}

          {/* Botão Confirmar - apenas se agendada e for médico/admin */}
          {isAgendada && (userRole === 'DOCTOR' || userRole === 'ADMIN') && (
            <Button
              variant="primary"
              onClick={() => {
                onUpdateStatus(appointment, 'CONFIRMADA')
                onClose()
              }}
            >
              ✓ Confirmar
            </Button>
          )}

          {/* Botão Marcar como Realizada - apenas se confirmada e for médico/admin */}
          {isConfirmada && (userRole === 'DOCTOR' || userRole === 'ADMIN') && (
            <Button
              variant="primary"
              onClick={() => {
                onUpdateStatus(appointment, 'REALIZADA')
                onClose()
              }}
            >
              ✓✓ Marcar como Realizada
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente de Badge de Status
function StatusBadge({ status }) {
  const statusConfig = {
    AGENDADA: { variant: 'info', label: 'Agendada', icon: '📅' },
    CONFIRMADA: { variant: 'warning', label: 'Confirmada', icon: '✓' },
    REALIZADA: { variant: 'success', label: 'Realizada', icon: '✓✓' },
    CANCELADA: { variant: 'error', label: 'Cancelada', icon: '✕' },
  }

  const config = statusConfig[status] || statusConfig.AGENDADA

  return (
    <Badge variant={config.variant}>
      {config.icon} {config.label}
    </Badge>
  )
}

// Funções auxiliares
function formatCPF(cpf) {
  if (!cpf) return 'N/A'

  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  return cpf
}

function formatPhone(phone) {
  if (!phone) return 'N/A'

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return phone
}