import { useState, useEffect } from 'react'
import { useApp } from '../store/AppContext'

function toIsoDateStr(date) {
  return date.toISOString().split('T')[0]
}

export function useStreak() {
  const { stars, loaded } = useApp()
  const [streak, setStreak] = useState(0)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    if (!loaded) return

    const today = toIsoDateStr(new Date())
    const stored = stars.getStreakData()

    let newStreak = 1
    let newIsNew = false

    if (stored) {
      const { lastDate, count } = stored
      const diffDays = Math.round((new Date(today) - new Date(lastDate)) / 86400000)
      if (diffDays === 0) {
        newStreak = count
      } else if (diffDays === 1) {
        newStreak = count + 1
        newIsNew = true
      } else {
        newStreak = 1
        newIsNew = count > 1
      }
    }

    if (!stored || stored.lastDate !== today) {
      stars.setStreakData({ lastDate: today, count: newStreak })
    }

    setStreak(newStreak)
    if (newIsNew) {
      setIsNew(true)
      setTimeout(() => setIsNew(false), 3000)
    }
  }, [loaded])

  return { streak, isNew }
}
