import { StarDisplayRow } from './StarDisplayRow'

/**
 * WeekSummaryBar — displays computed stars + hearts for the active week.
 *
 * Props:
 *   stars    {number}
 *   hearts   {number}
 *   isLocked {boolean}
 *   onLock   {function} - called when "Woche abschließen" is clicked
 *   isSunday {boolean}  - show lock button only if Sunday or past week
 */
export function WeekSummaryBar({ stars = 0, hearts = 0, isLocked, onLock, canLock, isFutureOrCurrent }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-accent/10 border-b border-accent/20 flex-wrap">
      <StarDisplayRow stars={stars} max={7} size={20} className="text-accent" />
      <span className="text-accent font-semibold text-sm tabular-nums">
        {stars % 1 === 0 ? stars : stars.toFixed(1)} / 7
      </span>
      {hearts > 0 && (
        <span className="text-sm text-accent font-medium">❤️ {hearts}</span>
      )}
      <div className="ml-auto">
        {isLocked ? (
          <span className="text-xs text-text-3 flex items-center gap-1">🔒 Abgeschlossen</span>
        ) : canLock ? (
          <button
            onClick={onLock}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors focus:outline-none"
          >
            Woche abschließen
          </button>
        ) : isFutureOrCurrent ? (
          <span className="text-xs text-text-3">Abrechnung am Sonntag</span>
        ) : null}
      </div>
    </div>
  )
}
