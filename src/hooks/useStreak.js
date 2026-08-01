import { useState, useEffect } from 'react'

function toIsoDateStr(date) {
  return date.toISOString().split('T')[0]
}

export function useStreak() {
  const [streak, setStreak] = useState(0)
  const [isNew, setIsNew] = useState(false) // true for a moment when streak increases

  useEffect(() => {
    const today = toIsoDateStr(new Date())
    const stored = (() => {
      try { return JSON.parse(localStorage.getItem('tk_streak') || 'null') } catch { return null }
    })()

    let newStreak = 1
    let newIsNew = false

    if (stored) {
      const { lastDate, count } = stored
      const last = new Date(lastDate)
      const now = new Date(today)
      const diffDays = Math.round((now - last) / 86400000)

      if (diffDays === 0) {
        // Already visited today
        newStreak = count
      } else if (diffDays === 1) {
        // Consecutive day — increase streak
        newStreak = count + 1
        newIsNew = true
      } else {
        // Streak broken
        newStreak = 1
        newIsNew = count > 1 // only show "new" if they had a streak before
      }
    } else {
      newIsNew = false
    }

    localStorage.setItem('tk_streak', JSON.stringify({ lastDate: today, count: newStreak }))
    setStreak(newStreak)
    if (newIsNew) {
      setIsNew(true)
      setTimeout(() => setIsNew(false), 3000)
    }
  }, [])

  return { streak, isNew }
}
