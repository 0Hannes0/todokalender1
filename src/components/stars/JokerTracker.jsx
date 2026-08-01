/**
 * JokerTracker — shows 3 dot circles for Joker days.
 * Filled dots = used Joker days.
 * Interactive when editable=true: clicking a filled dot opens a date to remove.
 *
 * Props:
 *   jokerDays  {string[]} - array of ISO dates
 *   editable   {boolean}
 *   monthKey   {string}   - 'YYYY-MM'
 *   weekDays   {string[]} - ISO dates for the current week (for adding joker via day cards)
 */
export function JokerTracker({ jokerDays = [], used, max = 3 }) {
  const count = used !== undefined ? used : jokerDays.length

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-3 font-medium">Joker</span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border transition-colors ${
              i < count
                ? 'bg-accent border-accent'
                : 'bg-transparent border-border'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-text-3">{count}/{max}</span>
    </div>
  )
}
