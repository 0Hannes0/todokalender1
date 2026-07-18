import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
} from 'date-fns'
import { de } from 'date-fns/locale'

const WEEK_START = { weekStartsOn: 1 } // Montag

/**
 * Returns 42 Date objects (6 weeks) for the month containing `date`.
 */
export function buildMonthGrid(date) {
  const monthStart = startOfMonth(date)
  const gridStart = startOfWeek(monthStart, WEEK_START)
  const cells = []
  for (let i = 0; i < 42; i++) {
    cells.push(addDays(gridStart, i))
  }
  return cells
}

/**
 * Returns 7 Date objects for the ISO week containing `date`.
 */
export function buildWeekRow(date) {
  const weekStart = startOfISOWeek(date)
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/** Format date as 'YYYY-MM-DD' */
export function toIsoDate(date) {
  return format(date, 'yyyy-MM-dd')
}

/** Format as 'YYYY-Www' (ISO week key) */
export function toWeekKey(date) {
  const week = getISOWeek(date)
  const year = getISOWeekYear(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

/** Format as 'YYYY-MM' */
export function toMonthKey(date) {
  return format(date, 'yyyy-MM')
}

/** Format as 'YYYY' */
export function toYearKey(date) {
  return format(date, 'yyyy')
}

/** German month name + year */
export function formatMonthYear(date) {
  return format(date, 'MMMM yyyy', { locale: de })
}

/** German week range label, e.g. "14. – 20. Juli 2026" */
export function formatWeekRange(date) {
  const start = startOfISOWeek(date)
  const end = endOfISOWeek(date)
  const startStr = format(start, 'd. MMM', { locale: de })
  const endStr = format(end, 'd. MMM yyyy', { locale: de })
  return `${startStr} – ${endStr}`
}

/** German short month names */
export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

/** Weekday header labels, Monday first */
export const WEEKDAY_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export { addMonths, addWeeks, addYears }
