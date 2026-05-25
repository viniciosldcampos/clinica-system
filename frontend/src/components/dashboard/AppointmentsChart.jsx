import './AppointmentsChart.css'

const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function AppointmentsChart({
  data = [],
  isLoading = false
}) {
  // Dados padrão se não vier nada
  const chartData = data.length > 0 ? data : [45, 70, 55, 95, 82, 65, 110]

  // Encontrar valor máximo para calcular altura proporcional
  const maxValue = Math.max(...chartData)

  if (isLoading) {
    return (
      <div className="chart-container">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="chart-column">
            <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
            <span className="chart-label">{daysOfWeek[i]}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="chart-container">
      {chartData.map((value, index) => {
        // Calcular altura proporcional (min 40px, max 220px)
        const height = (value / maxValue) * 220 || 40

        return (
          <div key={index} className="chart-column">
            <div
              className="chart-bar"
              style={{ height: `${height}px` }}
              role="img"
              aria-label={`${daysOfWeek[index]}: ${value} consultas`}
            >
              <span className="chart-value">{value}</span>
            </div>
            <span className="chart-label">{daysOfWeek[index]}</span>
          </div>
        )
      })}
    </div>
  )
}