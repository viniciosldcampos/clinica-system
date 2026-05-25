import './Card.css'

export default function Card({
  children,
  className = '',
  noPadding = false,
  variant = 'default'
}) {
  return (
    <div className={`card card-${variant} ${noPadding ? 'no-padding' : ''} ${className}`}>
      {children}
    </div>
  )
}

// Sub-componente para Header do Card
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      {children}
    </div>
  )
}

// Sub-componente para Título do Card
export function CardTitle({ children, subtitle, className = '' }) {
  return (
    <div className={className}>
      <h2 className="card-title">{children}</h2>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
  )
}

// Sub-componente para Conteúdo do Card
export function CardContent({ children, className = '' }) {
  return (
    <div className={`card-content ${className}`}>
      {children}
    </div>
  )
}