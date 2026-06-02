import Card from '../ui/Card'
import './MetricCard.css'

export default function MetricCard({
  title,
  value,
  trend,
  isLoading = false,
  icon
}) {
  const isPositive = trend?.startsWith('+')

  if (isLoading) {
    return (
      <Card className="metric-card">
        <div className="skeleton" style={{ height: '20px', width: '60%' }}></div>
        <div className="skeleton" style={{ height: '48px', width: '80%', marginTop: '10px' }}></div>
        <div className="skeleton" style={{ height: '16px', width: '50%', marginTop: '10px' }}></div>
      </Card>
    )
  }

  return (
    <Card className="metric-card">
      <div className="metric-header">
        <p className="metric-title">{title}</p>
        {icon && (
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            className="metric-icon"
          />
        )}
      </div>

      <h2 className="metric-value">{value}</h2>

      {trend && (
        <span className={`metric-trend ${isPositive ? 'positive' : 'negative'}`}>
          {trend}
        </span>
      )}
    </Card>
  )
}