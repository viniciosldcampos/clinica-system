import { StatusBadge } from '../ui/Badge'
import './AppointmentsTable.css'

export default function AppointmentsTable({
  appointments = [],
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="table-loading">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px' }}></div>
        ))}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="table-empty">
        <p>Nenhuma consulta encontrada</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Especialidade</th>
            <th>Horário</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, index) => (
            <tr key={index}>
              <td className="table-patient">{appointment.patient}</td>
              <td>{appointment.doctor}</td>
              <td className="table-specialty">{appointment.specialty}</td>
              <td className="table-time">{appointment.time}</td>
              <td>
                <StatusBadge status={appointment.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}