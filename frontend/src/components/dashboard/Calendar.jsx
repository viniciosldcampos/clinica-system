import './Calendar.css'

export default function Calendar({
  currentDay = new Date().getDate(),
  onDayClick,
  isLoading = false
}) {
  // Gerar dias do mês (simplificado - 31 dias)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  if (isLoading) {
    return (
      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className="skeleton calendar-day-skeleton"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="calendar-grid" role="grid" aria-label="Calendário do mês">
      {days.map((day) => (
        <button
          key={day}
          className={`calendar-day ${day === currentDay ? 'active' : ''}`}
          onClick={() => onDayClick && onDayClick(day)}
          aria-label={`Dia ${day}`}
          aria-current={day === currentDay ? 'date' : undefined}
        >
          {day}
        </button>
      ))}
    </div>
  )
}