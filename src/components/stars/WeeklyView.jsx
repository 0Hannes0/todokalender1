import { DayEntryCard } from './DayEntryCard'

/**
 * WeeklyView — renders 7 DayEntryCards for Mon–Sun.
 *
 * Props:
 *   weekDays  {string[]} - 7 ISO date strings [Mon..Sun]
 *   weekKey   {string}
 *   monthKey  {string}
 *   weekData  {object}   - stars.weeks[weekKey]
 *   jokerDays {string[]} - from stars.months[monthKey].jokerDays
 *   isLocked  {boolean}
 */
export function WeeklyView({ weekDays, weekKey, monthKey, weekData, jokerDays = [], isLocked }) {
  const days = weekData?.days || {}

  return (
    <div className="flex flex-col gap-2">
      {weekDays.map(isoDate => (
        <DayEntryCard
          key={isoDate}
          isoDate={isoDate}
          weekKey={weekKey}
          monthKey={monthKey}
          dayData={days[isoDate]}
          jokerDays={jokerDays}
          isLocked={isLocked}
        />
      ))}
    </div>
  )
}
