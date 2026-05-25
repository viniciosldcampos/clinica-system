import './NotificationsList.css'

export default function NotificationsList({
  notifications = [],
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="notifications-list">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="notification-card">
            <div className="skeleton" style={{ height: '20px', width: '70%' }}></div>
            <div className="skeleton" style={{ height: '16px', width: '100%', marginTop: '8px' }}></div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="notifications-empty">
        <p>Nenhuma notificação</p>
      </div>
    )
  }

  return (
    <div className="notifications-list" role="list">
      {notifications.map((notification, index) => (
        <article
          key={index}
          className="notification-card"
          role="listitem"
        >
          <div className="notification-header">
            <h3 className="notification-title">{notification.title}</h3>
            {notification.time && (
              <span className="notification-time">{notification.time}</span>
            )}
          </div>
          <p className="notification-description">{notification.description}</p>
        </article>
      ))}
    </div>
  )
}