import { useApp } from '../../store/AppContext'
import { buildMonthGrid, WEEKDAY_LABELS, toIsoDate } from '../../utils/dateHelpers'
import { DayCell } from '../day/DayCell'

export function MonthView() {
  const { state } = useApp()
  const { currentDate } = state
  const cells = buildMonthGrid(currentDate)

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map(day => (
          <div key={day} className="text-xs font-medium text-charcoal-light text-center py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
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
