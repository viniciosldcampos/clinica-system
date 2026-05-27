import Badge from '../ui/Badge'
import Button from '../ui/Button'
import './DoctorsTable.css'

export default function DoctorsTable({
  doctors = [],
  isLoading = false,
  onEdit,
  onDelete,
  onToggleActive
}) {
  if (isLoading) {
    return (
      <div className="doctors-table-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px' }}></div>
        ))}
      </div>
    )
  }

  if (doctors.length === 0) {
    return (
      <div className="doctors-table-empty">
        <div className="empty-icon">👨‍⚕️</div>
        <h3>Nenhum médico encontrado</h3>
        <p>Adicione o primeiro médico ou ajuste os filtros de busca.</p>
      </div>
    )
  }

  return (
    <div className="doctors-table-wrapper">
      <table className="doctors-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CRM</th>
            <th>Especialidade</th>
            <th>Telefone</th>
            <th>Status</th>
            <th className="actions-column">Ações</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id}>
              <td className="doctor-name">
                <div className="doctor-avatar">
                  {doctor.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <div className="name">{doctor.name}</div>
                  <div className="email">{doctor.user?.email || 'N/A'}</div>
                </div>
              </td>
              <td className="doctor-crm">{doctor.crm}</td>
              <td>
                <Badge variant="default">{doctor.specialty}</Badge>
              </td>
              <td className="doctor-phone">{formatPhone(doctor.phone)}</td>
              <td>
                <Badge variant={doctor.user?.isActive ? 'success' : 'error'}>
                  {doctor.user?.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
              <td className="actions-column">
                <div className="action-buttons">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(doctor)}
                    ariaLabel={`Editar ${doctor.name}`}
                  >
                    ✏️
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleActive(doctor)}
                    ariaLabel={doctor.user?.isActive ? `Desativar ${doctor.name}` : `Ativar ${doctor.name}`}
                  >
                    {doctor.user?.isActive ? '🔴' : '🟢'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(doctor)}
                    ariaLabel={`Deletar ${doctor.name}`}
                  >
                    🗑️
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

// Função auxiliar para formatar telefone
function formatPhone(phone) {
  if (!phone) return 'N/A'

  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '')

  // Formata: (11) 98765-4321
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }

  // Formata: (11) 3456-7890
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return phone
}