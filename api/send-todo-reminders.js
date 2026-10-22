import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Returns { date: "YYYY-MM-DD", time: "HH:MM" } for a timezone right now
function nowInTz(tz) {
  const now = new Date()
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
  return { date, time }
}

// Add N minutes to "HH:MM", returns "HH:MM"
function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

// Convert "HH:MM" to total minutes since midnight
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Check if reminderTime falls in the window [windowStart, windowStart+15min)
// Also handles midnight wrap-around
function isInWindow(reminderTime, windowStart) {
  const r = toMinutes(reminderTime)
  const ws = toMinutes(windowStart)
  const we = (ws + 15) % (24 * 60)
  if (ws <= we) return r >= ws && r < we
  // Wraps midnight
  return r >= ws || r < we
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end()
  }

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET is not configured')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const secret = req.headers['authorization']
  if (secret !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Fetch all users' todos + push subscriptions (incl. timezone) in parallel
  const [{ data: allUserData, error: dataError }, { data: subs, error: subsError }] = await Promise.all([
    supabase.from('user_data').select('user_id, todos'),
    supabase.from('push_subscriptions').select('user_id, subscription, timezone'),
  ])

  if (dataError) return res.status(500).json({ error: dataError.message })
  if (subsError) return res.status(500).json({ error: subsError.message })

  if (!allUserData?.length || !subs?.length) {
    return res.status(200).json({ sent: 0 })
  }

  // Build lookup: user_id → { subscription, timezone }
  const subByUser = {}
  for (const { user_id, subscription, timezone } of subs) {
    subByUser[user_id] = { subscription, timezone: timezone || 'Europe/Berlin' }
  }

  const toSend = []

  for (const { user_id, todos } of allUserData) {
    const entry = subByUser[user_id]
    if (!entry) continue

    const tz = entry.timezone
    const { date: todayInTz, time: currentTimeInTz } = nowInTz(tz)
    // Cron läuft alle 15 Min. Suche Todos deren reminderTime im Fenster
    // [now+15, now+30) liegt → schicke Erinnerung jetzt (kommt 15 Min. vor dem Todo an)
    const windowStart = addMinutes(currentTimeInTz, 15)

    const dayTodos = todos?.[todayInTz] || []
    for (const todo of dayTodos) {
      if (
        todo.reminderEnabled &&
        todo.reminderTime &&
        isInWindow(todo.reminderTime, windowStart) &&
        !todo.completed
      ) {
        toSend.push({ user_id, todo_id: todo.id, todo_label: todo.label, todo_time: todo.reminderTime, subscription: entry.subscription })
      }
    }
  }

  if (!toSend.length) {
    return res.status(200).json({ sent: 0, checked: allUserData.length })
  }

  // Deduplicate: don't send the same todo reminder twice today
  const reminderKeys = toSend.map(r => `${r.user_id}:${r.todo_id}:${new Date().toISOString().slice(0, 10)}`)

  const { data: alreadySent } = await supabase
    .from('sent_reminders')
    .select('reminder_key')
    .in('reminder_key', reminderKeys)

  const alreadySentSet = new Set((alreadySent || []).map(r => r.reminder_key))

  const today = new Date().toISOString().slice(0, 10)
  const pending = toSend.filter(r => !alreadySentSet.has(`${r.user_id}:${r.todo_id}:${today}`))

  if (!pending.length) {
    return res.status(200).json({ sent: 0, skipped: toSend.length })
  }

  // Send push notifications
  const results = await Promise.allSettled(
    pending.map(({ todo_label, todo_time, subscription }) => {
      const payload = JSON.stringify({
        title: `⏰ ${todo_label}`,
        body: `Startet um ${todo_time} Uhr – in 15 Minuten.`,
        url: '/',
        tag: `todo-reminder-${Date.now()}`,
      })
      return webpush.sendNotification(subscription, payload)
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length

  // Mark successful sends to avoid duplicates
  const sentKeys = pending
    .filter((_, i) => results[i].status === 'fulfilled')
    .map(r => ({ reminder_key: `${r.user_id}:${r.todo_id}:${today}`, sent_at: new Date().toISOString() }))

  if (sentKeys.length) {
    await supabase.from('sent_reminders').insert(sentKeys)
  }

  return res.status(200).json({ sent, total: pending.length })
}
