import { StarDisplayRow } from './StarDisplayRow'
import { JokerTracker } from './JokerTracker'
import { HerzenTracker } from './HerzenTracker'
import { StatusBadge } from './StatusBadge'
import { computeMonthSummary } from '../../utils/starCalc'
import { formatMonthYear } from '../../utils/dateHelpers'

/**
 * MonthSummaryCard — shows monthly totals, Joker tracker, hearts, and reward/punishment badge.
 *
 * Props:
 *   monthKey  {string}  - 'YYYY-MM'
 *   allWeeks  {object}  - stars.weeks (all weeks)
 *   monthData {object}  - stars.months[monthKey]
 *   isCurrentMonth {boolean}
 */
export function MonthSummaryCard({ monthKey, allWeeks = {}, monthData = {} }) {
  const summary = computeMonthSummary(monthKey, allWeeks, monthData)
  const { totalStars, totalHearts, kasse, kassePct, status } = summary

  const monthDate = new Date(monthKey + '-15')
  const monthLabel = formatMonthYear(monthDate)

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <p className="text-xs font-medium text-text-3 uppercase tracking-wide">{monthLabel}</p>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Star total */}
        <div className="flex items-center gap-3">
          <StarDisplayRow stars={Math.min(totalStars, 7)} max={7} size={22} className="text-accent" />
          <div>
            <span className="text-2xl font-bold text-accent tabular-nums">{totalStars}</span>
            <span className="text-text-3 text-sm ml-1">Sterne</span>
          </div>
        </div>

        {/* Joker tracker */}
        <JokerTracker jokerDays={monthData.jokerDays || []} />

        {/* Hearts tracker */}
        <HerzenTracker hearts={totalHearts} />

        {/* Status badge */}
        <StatusBadge
          status={status}
          totalStars={totalStars}
          kasse={kasse}
          kassePct={kassePct}
        />
      </div>
    </div>
  )
}
