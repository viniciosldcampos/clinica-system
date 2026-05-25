import './Badge.css'

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  )
}

// Variantes específicas para status
export function StatusBadge({ status }) {
  const statusMap = {
    'Confirmada': 'success',
    'Em andamento': 'info',
    'Pendente': 'warning',
    'Cancelada': 'error',
    'Realizada': 'success'
  }

  const variant = statusMap[status] || 'default'

  return <Badge variant={variant}>{status}</Badge>
}