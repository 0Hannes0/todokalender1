import { CalendarHeader } from '../calendar/CalendarHeader'
import { CalendarGrid } from '../calendar/CalendarGrid'
import { LeftPanel } from './LeftPanel'

export function AppShell() {
  return (
    <div className="h-screen flex overflow-hidden bg-bg">
      {/* Left panel: mini calendar + day todos + goals */}
      <div className="w-72 flex-shrink-0">
        <LeftPanel />
      </div>

      {/* Right: main calendar */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        <CalendarHeader />
        <div className="flex-1 overflow-auto">
          <CalendarGrid />
        </div>
      </div>
    </div>
  )
}
