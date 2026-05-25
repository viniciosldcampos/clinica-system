import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'doctors', label: 'Médicos', icon: '👨‍⚕️' },
  { id: 'patients', label: 'Pacientes', icon: '🧑' },
  { id: 'appointments', label: 'Consultas', icon: '📅' },
  { id: 'notifications', label: 'Notificações', icon: '🔔' },
  { id: 'settings', label: 'Configurações', icon: '⚙️' },
]

export default function Sidebar({
  activeItem = 'dashboard',
  onMenuClick,
  user
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Menu principal">
      <div>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">
            <div className="sidebar-logo-dot"></div>
          </div>

          <div>
            <h1 className="sidebar-title">HealthCare Pro</h1>
            <p className="sidebar-subtitle">Painel Administrativo</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onMenuClick && onMenuClick(item.id)}
              aria-current={activeItem === item.id ? 'page' : undefined}
            >
              <span className="sidebar-item-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {/* Botão de Logout */}
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          aria-label="Sair do sistema"
        >
          <span className="sidebar-item-icon" aria-hidden="true">🚪</span>
          Sair
        </button>

        {/* Profile */}
        {user && (
          <div className="sidebar-profile">
            <div className="sidebar-avatar" aria-hidden="true">
              {user.initials || user.name?.charAt(0) || 'U'}
            </div>

            <div>
              <h3 className="sidebar-profile-name">{user.name}</h3>
              <p className="sidebar-profile-role">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}