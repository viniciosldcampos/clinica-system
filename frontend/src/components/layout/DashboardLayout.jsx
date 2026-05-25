import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './DashboardLayout.css'

export default function DashboardLayout({
  children,
  title,
  subtitle,
  user,
  onSearch,
  notificationCount = 0,
  onNotificationClick
}) {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleMenuClick = (itemId) => {
    setActiveMenuItem(itemId)
    setSidebarOpen(false)

    // Navegar para a rota correspondente
    const routes = {
      dashboard: '/dashboard',
      doctors: '/doctors',
      patients: '/patients',
      appointments: '/appointments',
      notifications: '/dashboard',
      settings: '/dashboard',
    }

    if (routes[itemId]) {
      navigate(routes[itemId])
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={toggleSidebar}
        aria-label="Abrir menu"
        aria-expanded={sidebarOpen}
      >
        <span className="mobile-menu-icon">☰</span>
      </button>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          activeItem={activeMenuItem}
          onMenuClick={handleMenuClick}
          user={user}
        />
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        <Header
          title={title}
          subtitle={subtitle}
          onSearch={onSearch}
          notificationCount={notificationCount}
          onNotificationClick={onNotificationClick}
        />

        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  )
}