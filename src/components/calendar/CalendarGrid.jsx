import { useApp } from '../../store/AppContext'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { YearView } from './YearView'

export function CalendarGrid() {
  const { state } = useApp()

  if (state.view === 'week') return <WeekView />
  if (state.view === 'year') return <YearView />
  return <MonthView />
}
