import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { toIsoDate, toWeekKey, formatWeekRange } from '../../utils/dateHelpers'
import { computeWeekStars, weekToMonthKey, getWeekDays } from '../../utils/starCalc'
import { addWeeks } from 'date-fns'
import { WeeklyView } from './WeeklyView'
import { WeekSummaryBar } from './WeekSummaryBar'
import { TrainingWeekPanel } from './TrainingWeekPanel'
import { MonthSummaryCard } from './MonthSummaryCard'

export function StarTracker() {
  const { stars: starsApi } = useApp()

  // Navigate by week
  const [anchorDate, setAnchorDate] = useState(() => new Date())

  const weekKey = toWeekKey(anchorDate)
  const weekDays = getWeekDays(weekKey) // ['2026-07-27', ..., '2026-08-02']
  const monthKey = weekToMonthKey(weekKey)

  const weekData = starsApi.getWeekStars(weekKey) || {}
  const monthData = starsApi.getMonthStars(monthKey) || {}
  const jokerDays = monthData.jokerDays || []

  const isLocked = weekData.lockedStars !== null && weekData.lockedStars !== undefined

  // Computed stars for the current week
  const { stars: computedStars, hearts: computedHearts } = computeWeekStars(weekData, jokerDays, weekKey)

  // Can lock if not already locked (available anytime for past/current weeks)
  const today = toIsoDate(new Date())
  const weekSunday = weekDays[6]
  const isSunday = new Date().getDay() === 0
  const isPastWeek = weekSunday < today
  const canLock = !isLocked && (isPastWeek || (weekSunday === today && isSunday))

  function handleLock() {
    const confirmed = window.confirm(
      `Woche abschließen?\n\n${computedStars} Sterne · ${computedHearts} ❤️\n\nDanach sind Änderungen gesperrt.`
    )
    if (confirmed) {
      starsApi.lockWeek(weekKey, computedStars, computedHearts, monthKey)
    }
  }

  function navWeek(delta) {
    setAnchorDate(prev => addWeeks(prev, delta))
  }

  // Week range label
  const weekLabel = formatWeekRange(anchorDate)
  const kwNum = weekKey.split('-W')[1]

  // Collect all weeks to compute monthly summary (any week for this month)
  const allWeeksData = {}
  // We include the raw API data — MonthSummaryCard will compute from allWeeks
  // Provide access via a getter — pass the underlying stars.weeks object
  // Since we don't have direct access here, we use a workaround:
  // starsApi.getWeekStars returns individual weeks; for month summary we need all weeks
  // Solution: pass raw via a custom getter that the context exposes
  // For now, we reconstruct what we need for the month card:
  // We'll pass weekData for the current week + any cached data

  return (
    <div className="absolute inset-0 bg-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-5 pb-3 bg-surface border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text">⭐ Sternenabrechnung</h2>
            <p className="text-xs text-text-3 mt-0.5">KW {kwNum} · {weekLabel}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navWeek(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg transition-colors focus:outline-none text-text-3"
              aria-label="Vorherige Woche"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setAnchorDate(new Date())}
              className="text-xs text-accent font-medium px-2 py-1 rounded-full hover:bg-accent/10 transition-colors focus:outline-none"
            >
              Heute
            </button>
            <button
              onClick={() => navWeek(1)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg transition-colors focus:outline-none text-text-3"
              aria-label="Nächste Woche"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stars summary bar */}
      <WeekSummaryBar
        stars={isLocked ? weekData.lockedStars : computedStars}
        hearts={isLocked ? weekData.lockedHearts : computedHearts}
        isLocked={isLocked}
        onLock={handleLock}
        canLock={canLock}
        isFutureOrCurrent={!isLocked && !isPastWeek}
      />

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-3 pb-8">
        {/* Daily entry cards */}
        <WeeklyView
          weekDays={weekDays}
          weekKey={weekKey}
          monthKey={monthKey}
          weekData={weekData}
          jokerDays={jokerDays}
          isLocked={isLocked}
        />

        {/* Training panel */}
        <TrainingWeekPanel
          weekKey={weekKey}
          weekDays={weekDays}
          training={weekData.training || {}}
          isLocked={isLocked}
        />

        {/* Monthly summary */}
        <MonthSummaryCardWrapper
          monthKey={monthKey}
          monthData={monthData}
          currentWeekKey={weekKey}
          currentWeekData={weekData}
          starsApi={starsApi}
        />
      </div>
    </div>
  )
}

/**
 * Wrapper that assembles allWeeks for the month summary.
 * We need to reconstruct all weeks for the month — we do this by computing
 * the weeks whose Sunday falls in the month, then fetching each.
 */
function MonthSummaryCardWrapper({ monthKey, monthData, currentWeekKey, currentWeekData, starsApi }) {
  // Build a weeks map that includes at least the current week
  // For a full implementation, we'd need to iterate all possible weeks in the month
  // We do a simple reconstruction: check up to 5 weeks that could contain this month
  const allWeeks = buildMonthWeeks(monthKey, starsApi, currentWeekKey, currentWeekData)

  return (
    <MonthSummaryCard
      monthKey={monthKey}
      allWeeks={allWeeks}
      monthData={monthData}
    />
  )
}

/**
 * Builds a partial weeks map for the given month by probing weeks whose Sunday falls in the month.
 */
function buildMonthWeeks(monthKey, starsApi, currentWeekKey, currentWeekData) {
  const result = {}

  // The month has at most 5 calendar weeks. Find them by checking the Sundays.
  // Start from the first Sunday on or after the first of the month.
  const [year, mon] = monthKey.split('-').map(Number)
  const firstOfMonth = new Date(year, mon - 1, 1)
  const lastOfMonth = new Date(year, mon, 0) // last day

  // Check every day to find Sundays
  for (let d = new Date(firstOfMonth); d <= lastOfMonth; d = new Date(d.getTime() + 86400000)) {
    if (d.getDay() === 0) { // Sunday
      const iso = toIsoDate(d)
      const wk = toWeekKey(d)
      if (wk === currentWeekKey) {
        result[wk] = currentWeekData
      } else {
        const wd = starsApi.getWeekStars(wk)
        if (wd) result[wk] = wd
      }
    }
  }

  // Also add current week key directly
  if (!result[currentWeekKey]) {
    result[currentWeekKey] = currentWeekData
  }

  return result
}
