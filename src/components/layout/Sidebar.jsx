import { GoalsPanel } from '../goals/GoalsPanel'

export function Sidebar() {
  return (
    <aside className="h-full flex flex-col bg-cream-dark border-r border-cream-dark/80">
      {/* Branding */}
      <div className="px-6 py-5 border-b border-cream-dark/60">
        <h1 className="text-xl font-semibold text-charcoal tracking-tight">TodoKalender</h1>
        <p className="text-xs text-charcoal-light mt-0.5">Deine Ziele & Aufgaben</p>
      </div>

      {/* Goals */}
      <div className="flex-1 overflow-y-auto">
        <GoalsPanel />
      </div>
    </aside>
  )
}
