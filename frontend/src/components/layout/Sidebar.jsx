import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'
import dashboardIcon from '../../icons/dashboard.png'
import doctorsIcon from '../../icons/doctors.png'
import patientsIcon from '../../icons/patients.png'
import appointmentsIcon from '../../icons/appointments.png'
import notificationsIcon from '../../icons/notifications.png'
import settingsIcon from '../../icons/settings.png'
import exitIcon from '../../icons/exit.png'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: dashboardIcon },
  { id: 'doctors', label: 'Médicos', icon: doctorsIcon },
  { id: 'patients', label: 'Pacientes', icon: patientsIcon },
  { id: 'appointments', label: 'Consultas', icon: appointmentsIcon },
  { id: 'notifications', label: 'Notificações', icon: notificationsIcon },
  { id: 'settings', label: 'Configurações', icon: settingsIcon },
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
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className="sidebar-item-icon"
              />
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
          <img
            src={exitIcon}
            alt=""
            aria-hidden="true"
            className="sidebar-item-icon"
          />
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