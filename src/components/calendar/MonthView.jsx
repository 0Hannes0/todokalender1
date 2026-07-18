import { useApp } from '../../store/AppContext'
import { buildMonthGrid, WEEKDAY_LABELS, toIsoDate } from '../../utils/dateHelpers'
import { DayCell } from '../day/DayCell'

export function MonthView() {
  const { state } = useApp()
  const { currentDate } = state
  const cells = buildMonthGrid(currentDate)

  return (
    <div className="p-5 h-full flex flex-col">
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map(day => (
          <div key={day} className="text-xs font-medium text-text-muted text-center py-2 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 gap-1">
        {cells.map(date => (
          <DayCell
            key={toIsoDate(date)}
            date={date}
            currentMonth={currentDate}
          />
        ))}
      </div>
    </div>
  )
}
