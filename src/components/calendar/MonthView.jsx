import { useApp } from '../../store/AppContext'
import { buildMonthGrid, WEEKDAY_LABELS, toIsoDate } from '../../utils/dateHelpers'
import { DayCell } from '../day/DayCell'

export function MonthView() {
  const { state } = useApp()
  const { currentDate } = state
  const cells = buildMonthGrid(currentDate)

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map(day => (
          <div key={day} className="text-center text-[11px] font-semibold text-text-3 uppercase tracking-wider py-2 border-r border-border last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
        {cells.map(date => (
          <DayCell key={toIsoDate(date)} date={date} currentMonth={currentDate} />
        ))}
      </div>
    </div>
  )
}
