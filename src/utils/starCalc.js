import { buildWeekRow, toIsoDate, toMonthKey, toWeekKey } from './dateHelpers'
import { startOfISOWeek, endOfISOWeek, addDays } from 'date-fns'

// --- Week days for a given weekKey ---

/** Returns array of ISO date strings [Mon..Sun] for the given weekKey ('YYYY-Www') */
export function getWeekDays(weekKey) {
  // Parse weekKey back to a date — find the Monday
  const [yearStr, wStr] = weekKey.split('-W')
  const year = parseInt(yearStr, 10)
  const week = parseInt(wStr, 10)
  // Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4)
  const jan4ISODay = jan4.getDay() || 7 // 1=Mon..7=Sun
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - (jan4ISODay - 1) + (week - 1) * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return toIsoDate(d)
  })
}

/**
 * Computes the star total and heart bonus for a single week.
 *
 * @param {object} weekData  - The week entry from stars.weeks[weekKey]
 * @param {string[]} jokerDays - Array of ISO dates marked as Joker for this month
 * @param {string} weekKey   - 'YYYY-Www'
 * @returns {{ stars: number, hearts: number }}
 */
export function computeWeekStars(weekData, jokerDays = []) {
  if (!weekData) return { stars: 0, hearts: 0 }

  const days = weekData.days || {}
  const training = weekData.training || {}
  const jokerSet = new Set(jokerDays)

  let base = 7
  let halfPenalty = 0
  let hearts = 0

  // Derive week days from the first day key we can find, or use training session dates
  // Build the 7 day keys from the week structure
  const dayKeys = Object.keys(days)

  // For days that exist in the data
  for (const isoDate of dayKeys) {
    // Joker → skip, no deduction
    if (jokerSet.has(isoDate)) continue

    const day = days[isoDate]
    if (!day) continue

    // Sick day (Fieber) → always excused
    if (day.fieber) continue

    let dayFail = false

    if (!day.kalorien) dayFail = true
    if (!day.eiweiss) dayFail = true

    const schritte = Number(day.schritte) || 0
    if (schritte < 6000) {
      dayFail = true
    } else if (schritte < 8000) {
      halfPenalty += 0.5
    }
    if (schritte >= 15000) hearts += 1

    // Wasser: only half-star if day wasn't already failing on other criteria
    if (!day.wasser) {
      if (!dayFail) {
        halfPenalty += 0.5
      }
      // If dayFail is already true, water fail doesn't add extra
    }

    if (dayFail) base -= 1
  }

  base -= halfPenalty

  // --- Training evaluation (weekly) ---
  const kraft = (training.kraft || []).filter(s => Number(s.minuten) >= 30)
  const pilates = (training.pilates || []).filter(s => Number(s.minuten) >= 30)
  const jokerUsed = !!training.jokerUsed
  const ausnahme = !!training.ausnahme

  if (ausnahme) {
    const allPilates = training.pilates || []
    const pilates45 = allPilates.filter(s => Number(s.minuten) >= 45).length
    const pilatesValid = allPilates.filter(s => Number(s.minuten) >= 30).length
    if (!(pilates45 >= 3 && pilatesValid >= 5)) {
      base -= 1
    }
  } else {
    const requiredKraft = jokerUsed ? 2 : 3
    const requiredPilates = jokerUsed ? 3 : 2
    const kraftOK = kraft.length >= requiredKraft
    const pilatesOK = pilates.length >= requiredPilates
    if (!kraftOK && !pilatesOK) base -= 2
    else if (!kraftOK) base -= 1
    else if (!pilatesOK) base -= 1
  }

  return { stars: Math.max(0, base), hearts }
}

/**
 * Computes the monthly summary from all weeks that fall (by their Sunday) in a month.
 *
 * @param {string} monthKey  - 'YYYY-MM'
 * @param {object} allWeeks  - stars.weeks map
 * @param {object} monthData - stars.months[monthKey]
 * @returns {{ totalStars, totalHearts, kasse, kassePct, bonusTage, belohnung, sonderbelohnung, status }}
 */
export function computeMonthSummary(monthKey, allWeeks = {}, monthData = {}) {
  let totalStars = 0
  let totalHearts = 0

  // Sum locked stars/hearts from weeks whose Sunday falls in this month
  for (const [weekKey, weekData] of Object.entries(allWeeks)) {
    if (weekData.lockedStars === null || weekData.lockedStars === undefined) continue
    // Find the Sunday of this week
    const days = getWeekDays(weekKey)
    const sunday = days[6] // last day = Sunday
    if (sunday && sunday.startsWith(monthKey)) {
      totalStars += weekData.lockedStars
      totalHearts += (weekData.lockedHearts || 0)
    }
  }

  const jokerDays = monthData.jokerDays || []
  const noJokersUsed = jokerDays.length === 0

  let kasse = 0
  let kassePct = 100
  let bonusTage = 0
  let belohnung = null
  let sonderbelohnung = false

  // Punishments first
  if (totalStars < 10) {
    kasse = 40
    kassePct = 50
  } else if (totalStars < 20) {
    kasse = 20
    kassePct = 60
  } else if (totalStars < 24) {
    kasse = 10
    kassePct = 100
  } else if (totalStars <= 26) {
    bonusTage = -1
  }

  // Rewards (only if no punishment threshold)
  if (totalStars >= 31 && noJokersUsed) {
    sonderbelohnung = true
    kasse = 0
    bonusTage = 0
  } else if (totalStars >= 27) {
    belohnung = 'freiTag' // +1 skip day next month
    kasse = 0
    bonusTage = 0
  }

  let status = 'neutral'
  if (sonderbelohnung) status = 'sonderbelohnung'
  else if (belohnung) status = 'belohnung'
  else if (kasse > 0) status = kasse >= 40 ? 'strafe-schwer' : kasse >= 20 ? 'strafe-mittel' : 'strafe-leicht'
  else if (bonusTage < 0) status = 'strafe-mild'

  return { totalStars, totalHearts, kasse, kassePct, bonusTage, belohnung, sonderbelohnung, status }
}

/**
 * Returns the status of a single day for display purposes.
 *
 * @returns {'future' | 'joker' | 'krank' | 'perfect' | 'partial' | 'fail' | 'empty'}
 */
export function getDayStatus(isoDate, dayData, jokerDays = [], today) {
  const todayStr = today || toIsoDate(new Date())
  if (isoDate > todayStr) return 'future'
  if ((jokerDays || []).includes(isoDate)) return 'joker'
  if (!dayData) return 'empty'
  if (dayData.fieber) return 'krank'

  // Check if any required field is missing/failed
  const schritte = Number(dayData.schritte) || 0
  const stepsFail = schritte > 0 && schritte < 6000
  const hasFail = !dayData.kalorien || !dayData.eiweiss || stepsFail

  if (hasFail) return 'fail'

  const hasWarn = !dayData.wasser || (schritte >= 6000 && schritte < 8000)
  if (hasWarn) return 'partial'

  // All fields filled and passing
  if (dayData.kalorien && dayData.eiweiss && dayData.wasser && schritte >= 8000) return 'perfect'

  return 'partial'
}

/**
 * Returns the month key that contains the given week's Sunday.
 */
export function weekToMonthKey(weekKey) {
  const days = getWeekDays(weekKey)
  return days[6].substring(0, 7) // Sunday's YYYY-MM
}
