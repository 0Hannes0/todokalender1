import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ALLOWED_ORIGIN = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'https://todokalender1.vercel.app'

function setCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

export default async function handler(req, res) {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No auth' })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { subscription, timezone } = req.body
  if (!subscription || typeof subscription !== 'object') {
    return res.status(400).json({ error: 'Invalid subscription' })
  }
  if (!subscription.endpoint || typeof subscription.endpoint !== 'string') {
    return res.status(400).json({ error: 'Invalid subscription endpoint' })
  }

  // Validate timezone string (IANA format, e.g. "Europe/Berlin")
  const tz = typeof timezone === 'string' && /^[A-Za-z_]+\/[A-Za-z_\/]+$/.test(timezone)
    ? timezone
    : 'Europe/Berlin'

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: user.id, subscription, timezone: tz }, { onConflict: 'user_id' })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
