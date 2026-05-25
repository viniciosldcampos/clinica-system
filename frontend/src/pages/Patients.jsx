import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function Patients() {
  const { user } = useAuth()

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
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>🧑 Página de Pacientes</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Esta página será implementada em breve.
          </p>
          <Button variant="primary">
            Adicionar Paciente
          </Button>
        </div>
      </Card>
    </DashboardLayout>
  )
}