import MetricCard from './MetricCard'
import './MetricsGrid.css'

export default function MetricsGrid({ metrics, isLoading = false }) {
  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          trend={metric.trend}
          icon={metric.icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}