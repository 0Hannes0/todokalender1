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

// Check if reminderTime falls in the window [windowStart, windowStart+16min)
// Also handles midnight wrap-around
function isInWindow(reminderTime, windowStart) {
  const r = toMinutes(reminderTime)
  const ws = toMinutes(windowStart)
  const we = (ws + 16) % (24 * 60)
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

  const secret = req.headers['authorization'] || `Bearer ${req.query.secret}`
  if (secret !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Fetch all users' todos + push subscriptions (incl. timezone) in parallel
  // Retry once on any failure (e.g. transient 500 or JWT clock-skew from Vercel edge)
  async function fetchData() {
    const [r1, r2] = await Promise.all([
      supabase.from('user_data').select('user_id, todos'),
      supabase.from('push_subscriptions').select('user_id, subscription, timezone'),
    ])
    if (r1.error || r2.error) {
      // Small delay to let Supabase clock-skew resolve, then retry once
      await new Promise(resolve => setTimeout(resolve, 500))
      return Promise.all([
        supabase.from('user_data').select('user_id, todos'),
        supabase.from('push_subscriptions').select('user_id, subscription, timezone'),
      ])
    }
    return [r1, r2]
  }

  const [{ data: allUserData, error: dataError }, { data: subs, error: subsError }] = await fetchData()

  if (dataError) return res.status(500).json({ error: dataError.message })
  if (subsError) return res.status(500).json({ error: subsError.message })

  if (!allUserData?.length || !subs?.length) {
    return res.status(200).json({ sent: 0 })
  }

  // Build lookup: user_id → { subscription, timezone, endpointPrefix }
  const subByUser = {}
  for (const { user_id, subscription, timezone } of subs) {
    const ep = subscription?.endpoint || ''
    const endpointPrefix = ep.includes('fcm.googleapis.com') ? 'FCM(Chrome/Android)'
      : ep.includes('push.apple.com') ? `APNs(iOS-PWA):${ep.substring(0, 60)}`
      : ep.includes('mozilla.com') ? 'Mozilla(Firefox)'
      : ep.substring(0, 60)
    subByUser[user_id] = { subscription, timezone: timezone || 'Europe/Berlin', endpointPrefix }
  }

  const toSend = []
  const debug = []

  const forceUserId = req.query.force_user // bypass window + dedup for one user (debug only)

  for (const { user_id, todos } of allUserData) {
    const entry = subByUser[user_id]
    if (!entry) {
      debug.push({ user_id, issue: 'no_subscription' })
      continue
    }

    const tz = entry.timezone
    const { date: todayInTz, time: currentTimeInTz } = nowInTz(tz)
    const windowStart = addMinutes(currentTimeInTz, 14)
    const windowEnd = addMinutes(currentTimeInTz, 30)

    const dayTodos = todos?.[todayInTz] || []
    const reminderTodos = dayTodos
      .filter(t => t.reminderEnabled && t.reminderTime)
      .map(t => ({ id: t.id, label: t.label, reminderTime: t.reminderTime, completed: t.completed, inWindow: isInWindow(t.reminderTime, windowStart) }))
    debug.push({ user_id, tz, todayInTz, currentTimeInTz, windowStart, windowEnd, todosToday: dayTodos.length, reminderTodos, pushService: entry.endpointPrefix })

    // force_user: send ALL reminder-enabled todos for this user regardless of window
    if (forceUserId && user_id === forceUserId) {
      for (const todo of dayTodos) {
        if (todo.reminderEnabled && todo.reminderTime && !todo.completed) {
          toSend.push({ user_id, todo_id: todo.id, todo_label: todo.label, todo_time: todo.reminderTime, subscription: entry.subscription, forced: true })
        }
      }
      continue
    }

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
    return res.status(200).json({ sent: 0, checked: allUserData.length, debug })
  }

  // Deduplicate: don't send the same todo reminder twice today (skip for force mode)
  const reminderKeys = toSend.map(r => `${r.user_id}:${r.todo_id}:${new Date().toISOString().slice(0, 10)}`)
  const alreadySentSet = new Set()

  if (!forceUserId) {
    const { data: alreadySent } = await supabase
      .from('sent_reminders')
      .select('reminder_key')
      .in('reminder_key', reminderKeys)
    ;(alreadySent || []).forEach(r => alreadySentSet.add(r.reminder_key))
  }

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
        tag: `todo-reminder-${todo_id}`,
      })
      return webpush.sendNotification(subscription, payload)
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const pushResults = results.map((r, i) => ({
    user_id: pending[i]?.user_id,
    todo_id: pending[i]?.todo_id,
    status: r.status,
    statusCode: r.status === 'fulfilled' ? r.value?.statusCode : r.reason?.statusCode,
    headers: r.status === 'fulfilled' ? r.value?.headers : r.reason?.headers,
    body: r.status === 'rejected' ? (r.reason?.body || r.reason?.message) : undefined,
  }))
  const pushErrors = pushResults.filter(r => r.status === 'rejected')

  // Remove expired/invalid subscriptions (HTTP 410 Gone) from DB so user re-subscribes
  const expiredUserIds = pushErrors
    .filter(e => e.statusCode === 410 || e.statusCode === 404)
    .map(e => e.user_id)
    .filter(Boolean)
  if (expiredUserIds.length) {
    await supabase.from('push_subscriptions').delete().in('user_id', expiredUserIds)
  }

  // Mark successful sends to avoid duplicates
  const sentKeys = pending
    .filter((_, i) => results[i].status === 'fulfilled')
    .map(r => ({ reminder_key: `${r.user_id}:${r.todo_id}:${today}`, sent_at: new Date().toISOString() }))

  if (sentKeys.length) {
    await supabase.from('sent_reminders').insert(sentKeys)
  }

  return res.status(200).json({ sent, total: pending.length, pushResults, expiredRemoved: expiredUserIds.length || undefined })
}
