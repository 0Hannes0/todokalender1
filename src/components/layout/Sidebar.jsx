import { GoalsPanel } from '../goals/GoalsPanel'

export function Sidebar() {
  return (
    <aside className="h-full flex flex-col bg-surface">
      {/* Branding */}
      <div className="px-5 pt-7 pb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-wine-bright to-plum flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.9"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.6"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.6"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="white" fillOpacity="0.3"/>
            </svg>
          </div>
          <h1 className="text-base font-semibold text-text tracking-tight">TodoKalender</h1>
        </div>
        <p className="text-xs text-text-3 pl-9">Deine Ziele & Aufgaben</p>
      </div>

      <div className="h-px bg-border mx-5" />

      {/* Goals */}
      <div className="flex-1 overflow-y-auto py-4">
        <GoalsPanel />
      </div>
    </aside>
  )
}
