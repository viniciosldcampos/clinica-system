import Badge from '../ui/Badge'
import Button from '../ui/Button'
import './AppointmentsTable.css'
import viewIcon from '../../icons/view.png'
import editIcon from '../../icons/edit.png'
import deleteIcon from '../../icons/delete.png'
import agreeIcon from '../../icons/agree.png'

export default function AppointmentsTable({
  appointments = [],
  isLoading = false,
  onEdit,
  onCancel,
  onUpdateStatus,
  onViewDetails,
}) {
  if (isLoading) {
    return (
      <div className="appointments-table-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px' }}></div>
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="appointments-table-empty">
        <div className="empty-icon">📅</div>
        <h3>Nenhuma consulta encontrada</h3>
        <p>Agende uma nova consulta ou ajuste os filtros de busca.</p>
      </div>
    )
  }

  return (
    <div className="appointments-table-wrapper">
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Data/Hora</th>
            <th>Especialidade</th>
            <th>Status</th>
            <th className="actions-column">Ações</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              {/* PACIENTE */}
              <td className="appointment-patient">
                <div className="patient-info">
                  <div className="avatar">{appointment.patient?.name?.charAt(0) || 'P'}</div>
                  <div>
                    <div className="name">{appointment.patient?.name}</div>
                    <div className="cpf">{formatCPF(appointment.patient?.cpf)}</div>
                  </div>
                </div>
              </td>

              {/* MÉDICO */}
              <td className="appointment-doctor">
                <div className="doctor-info">
                  <div className="avatar">{appointment.doctor?.name?.charAt(0) || 'D'}</div>
                  <div className="name">{appointment.doctor?.name}</div>
                </div>
              </td>

              {/* DATA/HORA */}
              <td className="appointment-datetime">
                <div className="datetime">
                  <div className="date">{formatDate(appointment.appointmentDate)}</div>
                  <div className="time">{formatTime(appointment.appointmentDate)}</div>
                </div>
              </td>

              {/* ESPECIALIDADE */}
              <td className="appointment-specialty">
                <Badge variant="default">{appointment.doctor?.specialty}</Badge>
              </td>

              {/* STATUS */}
              <td className="appointment-status">
                <StatusBadge status={appointment.status} />
              </td>

              {/* AÇÕES */}
              <td className="actions-column">
                <div className="action-buttons">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(appointment)}
                    ariaLabel="Ver detalhes"
                  >
                    <img
                      src={viewIcon}
                      alt=""
                      aria-hidden="true"
                      className="sidebar-item-icon"
                    />
                  </Button>

                  {appointment.status === 'AGENDADA' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(appointment)}
                        ariaLabel="Reagendar"
                      >
                      <img
                        src={editIcon}
                        alt=""
                        aria-hidden="true"
                        className="sidebar-item-icon"
                      />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(appointment)}
                        ariaLabel="Cancelar"
                      >
                      <img
                        src={deleteIcon}
                        alt=""
                        aria-hidden="true"
                        className="sidebar-item-icon"
                      />
                      </Button>
                    </>
                  )}

                  {appointment.status === 'CONFIRMADA' && (
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateStatus(appointment, 'REALIZADA')}
                    ariaLabel="Marcar como realizada"
                    >
                    <img
                      src={agreeIcon}
                      alt=""
                      aria-hidden="true"
                      className="sidebar-item-icon"
                    />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

// Função auxiliar para formatar CPF
function formatCPF(cpf) {
  if (!cpf) return 'N/A'

  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  }

  return cpf
}

// Função auxiliar para formatar data
function formatDate(dateString) {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  } catch {
    return dateString
  }
}

// Função auxiliar para formatar hora
function formatTime(dateString) {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateString
  }
}