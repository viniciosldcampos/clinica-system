import DashboardLayout from '../components/layout/DashboardLayout'
import MetricsGrid from '../components/dashboard/MetricsGrid'
import AppointmentsChart from '../components/dashboard/AppointmentsChart'
import AppointmentsTable from '../components/dashboard/AppointmentsTable'
import Calendar from '../components/dashboard/Calendar'
import NotificationsList from '../components/dashboard/NotificationsList'
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user } = useAuth()
  const { metrics, appointments, notifications, isLoading } = useDashboard()

  const chartData = [45, 70, 55, 95, 82, 65, 110]

  return (
    <DashboardLayout
      title="Dashboard Geral"
      subtitle="Bem-vindo ao painel administrativo do HealthCare Pro."
      user={{
        name: user?.email || 'Usuário',
        role: user?.role || 'N/A',
        initials: user?.email?.substring(0, 2).toUpperCase() || 'U'
      }}
      notificationCount={notifications.length}
    >
      {/* Métricas */}
      <MetricsGrid metrics={metrics} isLoading={isLoading} />

      {/* Grid Principal */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 420px',
        gap: '32px',
        marginTop: '32px'
      }}>
        {/* Coluna Esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Gráfico de Consultas */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Visão geral semanal de atendimentos.">
                Fluxo de Consultas
              </CardTitle>
              <Button variant="secondary" size="sm">
                Últimos 7 dias
              </Button>
            </CardHeader>
            <CardContent>
              <AppointmentsChart data={chartData} isLoading={isLoading} />
            </CardContent>
          </Card>

          {/* Tabela de Consultas */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Últimos atendimentos registrados.">
                Consultas Recentes
              </CardTitle>
              <Button variant="primary" size="sm">
                Nova Consulta
              </Button>
            </CardHeader>
            <CardContent>
              <AppointmentsTable
                appointments={appointments}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Calendário */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Maio de 2026">
                Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                currentDay={25}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle subtitle="Atualizações em tempo real.">
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationsList
                notifications={notifications}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSS inline temporário para responsividade */}
      <style>{`
        @media (max-width: 1200px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}