import Badge from '../ui/Badge'
import Button from '../ui/Button'
import './PatientsTable.css'
import editIcon from '../../icons/edit.png'
import agreeIcon from '../../icons/agree.png'
import binIcon from '../../icons/bin.png'
import disabledIcon from '../../icons/disabled.png'


export default function PatientsTable({
  patients = [],
  isLoading = false,
  onEdit,
  onDelete,
  onToggleActive
}) {
  if (isLoading) {
    return (
      <div className="patients-table-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px' }}></div>
        ))}
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="patients-table-empty">
        <div className="empty-icon"></div>
        <h3>Nenhum paciente encontrado</h3>
        <p>Adicione o primeiro paciente ou ajuste os filtros de busca.</p>
      </div>
    )
  }

  return (
    <div className="patients-table-wrapper">
      <table className="patients-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Data de Nascimento</th>
            <th>Status</th>
            <th className="actions-column">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td className="patient-name">
                <div className="patient-avatar">
                  {patient.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <div className="name">{patient.name}</div>
                  <div className="email">{patient.email || 'N/A'}</div>
                </div>
              </td>
              <td className="patient-cpf">{formatCPF(patient.cpf)}</td>
              <td className="patient-phone">{formatPhone(patient.phone)}</td>
              <td className="patient-birthdate">{formatDate(patient.birthDate)}</td>
              <td>
                <Badge variant={patient.isActive ? 'success' : 'error'}>
                  {patient.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
              <td className="actions-column">
                <div className="action-buttons">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(patient)}
                    ariaLabel={`Editar ${patient.name}`}
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
                    onClick={() => onToggleActive(patient)}
                    ariaLabel={patient.isActive ? `Desativar ${patient.name}` : `Ativar ${patient.name}`}
                  >
                    {patient.isActive ? (<img src={disabledIcon} alt="Desativar" className="action-icon" />) : (<img src={agreeIcon} alt="Ativar" className="action-icon" />)}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(patient)}
                    ariaLabel={`Deletar ${patient.name}`}
                  >
                    <img
                      src={binIcon}
                      alt=""
                      aria-hidden="true"
                      className="sidebar-item-icon"
                    />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

// Função auxiliar para formatar telefone
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
