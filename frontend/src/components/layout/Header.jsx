import Input from '../ui/Input'
import './Header.css'

export default function Header({
  title = 'Dashboard',
  subtitle,
  onSearch,
  notificationCount = 0,
  onNotificationClick
}) {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && (
            <p className="header-subtitle">{subtitle}</p>
          )}
        </div>

        <div className="header-actions">
          {/* Search */}
          {onSearch && (
            <div className="header-search">
              <Input
                type="search"
                placeholder="Buscar pacientes, médicos ou consultas"
                onChange={(e) => onSearch(e.target.value)}
                aria-label="Buscar no sistema"
              />
            </div>
          )}

          {/* Notifications */}
          <button
            className="notification-button"
            onClick={onNotificationClick}
            aria-label={`${notificationCount} notificações não lidas`}
          >
            <span className="notification-icon" aria-hidden="true">🔔</span>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}