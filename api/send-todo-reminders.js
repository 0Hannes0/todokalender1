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

// Returns "YYYY-MM-DD" for the current UTC date
function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

// Returns "HH:MM" for the current UTC time
function nowHHMM() {
  const d = new Date()
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

// Add N minutes to "HH:MM", returns "HH:MM"
function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
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

  const today = todayUTC()
  const currentTime = nowHHMM()

  // Fetch all users' todos + push subscriptions in parallel
  const [{ data: allUserData, error: dataError }, { data: subs, error: subsError }] = await Promise.all([
    supabase.from('user_data').select('user_id, todos'),
    supabase.from('push_subscriptions').select('user_id, subscription'),
  ])

  if (dataError) return res.status(500).json({ error: dataError.message })
  if (subsError) return res.status(500).json({ error: subsError.message })

  if (!allUserData?.length || !subs?.length) {
    return res.status(200).json({ sent: 0 })
  }

  // Build lookup: user_id → push subscription
  const subByUser = {}
  for (const { user_id, subscription } of subs) {
    subByUser[user_id] = subscription
  }

  // Find todos that need a reminder right now (todoTime = currentTime + 15min)
  const targetTime = addMinutes(currentTime, 15)

  const toSend = [] // { user_id, todo_id, todo_label, subscription }

  for (const { user_id, todos } of allUserData) {
    const subscription = subByUser[user_id]
    if (!subscription) continue

    const dayTodos = todos?.[today] || []
    for (const todo of dayTodos) {
      if (
        todo.reminderEnabled &&
        todo.reminderTime &&
        todo.reminderTime === targetTime &&
        !todo.completed
      ) {
        toSend.push({ user_id, todo_id: todo.id, todo_label: todo.label, subscription })
      }
    }
  }

  if (!toSend.length) {
    return res.status(200).json({ sent: 0, checked: allUserData.length })
  }

  // Deduplicate: don't send the same todo reminder twice today
  // Check sent_reminders table (create it if needed via upsert)
  const reminderKeys = toSend.map(r => `${r.user_id}:${r.todo_id}:${today}`)

  const { data: alreadySent } = await supabase
    .from('sent_reminders')
    .select('reminder_key')
    .in('reminder_key', reminderKeys)

  const alreadySentSet = new Set((alreadySent || []).map(r => r.reminder_key))

  const pending = toSend.filter(r => !alreadySentSet.has(`${r.user_id}:${r.todo_id}:${today}`))

  if (!pending.length) {
    return res.status(200).json({ sent: 0, skipped: toSend.length })
  }

  // Send push notifications
  const results = await Promise.allSettled(
    pending.map(({ todo_label, subscription }) => {
      const payload = JSON.stringify({
        title: `⏰ ${todo_label}`,
        body: 'In 15 Minuten steht das auf deiner Liste.',
        url: '/',
        tag: `todo-reminder-${Date.now()}`,
      })
      return webpush.sendNotification(subscription, payload)
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length

  // Mark as sent (only the ones that succeeded)
  const sentKeys = pending
    .filter((_, i) => results[i].status === 'fulfilled')
    .map(r => ({ reminder_key: `${r.user_id}:${r.todo_id}:${today}`, sent_at: new Date().toISOString() }))

  if (sentKeys.length) {
    await supabase.from('sent_reminders').insert(sentKeys)
  }

  return res.status(200).json({ sent, total: pending.length })
}
