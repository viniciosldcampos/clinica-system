import DashboardLayout from './components/layout/DashboardLayout'
import MetricsGrid from './components/dashboard/MetricsGrid'
import { useDashboard } from './hooks/useDashboard'

function App() {
  const { metrics, isLoading } = useDashboard()

  const mockUser = {
    name: 'Vinicios Campos',
    role: 'Administrador',
    initials: 'VC'
  }

  return (
    <DashboardLayout
      title="Dashboard Geral"
      subtitle="Bem-vindo ao painel administrativo do HealthCare Pro."
      user={mockUser}
      notificationCount={3}
    >
      <MetricsGrid metrics={metrics} isLoading={isLoading} />
      
      <div style={{ marginTop: '32px', padding: '24px', background: 'white', borderRadius: '28px' }}>
        <h2>Dashboard funcionando! 🎉</h2>
        <p>Todos os componentes foram criados com sucesso.</p>
      </div>
    </DashboardLayout>
  )
}

export default App
