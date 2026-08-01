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

const MESSAGES = [
  // Motivierend
  { title: '🔥 Streak in Gefahr!', body: 'Du hast heute noch nichts eingetragen. Rette deinen Streak!' },
  { title: '💪 Kein Ausrede-Tag!', body: 'Auch kleine Fortschritte zählen. Kurz eintragen, fertig.' },
  { title: '🏆 Heute könnte dein bester Tag werden', body: 'Aber nur wenn du deine Ziele checkst.' },
  { title: '⚡ 30 Sekunden reichen', body: 'Mehr brauchst du nicht um deine Ziele zu updaten.' },
  { title: '🎯 Du bist so nah dran!', body: 'Trag deine Fortschritte ein und sieh wie weit du bist.' },
  // Duolingo-Style (ein bisschen frech)
  { title: '👀 Deine Ziele vermissen dich', body: 'Die warten schon den ganzen Tag. Kurz vorbeischauen?' },
  { title: '😤 Ernsthaft jetzt.', body: 'Wir wissen dass du Zeit hast. Ziele eintragen dauert 20 Sek.' },
  { title: '🐣 Piep piep!', body: 'Deine Ziele schlüpfen gleich aus — trag sie endlich ein!' },
  { title: '📣 Achtung, wichtige Meldung!', body: 'Deine Ziele wurden noch nicht eingetragen. Das war alles.' },
  { title: '🙄 Schon wieder Mittag…', body: '…und deine Ziele wurden immer noch nicht geupdatet. Na?' },
  // Inspirierend
  { title: '🌱 Kleine Schritte, großes Ziel', body: 'Was hast du heute schon erreicht? Trag es ein!' },
  { title: '✨ Wer aufschreibt, erreicht mehr', body: 'Studien belegen es. Also kurz eintragen!' },
  { title: '🗓️ Mittags-Momentum', body: 'Der beste Zeitpunkt um Ziele zu checken? Genau jetzt.' },
  { title: '🚀 Zukunfts-Du sagt Danke', body: 'Wenn du jetzt einträgst, freust du dich später drüber.' },
  { title: '💎 Konsequenz schlägt Motivation', body: 'Du musst es nicht wollen — einfach kurz eintragen.' },
  // Wochentag-Specials (Montag-Sonntag)
  { title: '😴 Montag? Na und!', body: 'Die Woche fängt jetzt an — setz deine Ziele für die Woche!' },
  { title: '🔄 Dienstags-Checkup', body: 'Wie läuft die Woche? Kurz reinschauen und updaten.' },
  { title: '⛰️ Mittwoch = Halbzeit!', body: 'Halbzeit der Woche. Liegst du noch im Plan?' },
  { title: '🏁 Donnerstag, fast geschafft!', body: 'Noch 2 Tage. Push nochmal — trag deine Fortschritte ein.' },
  { title: '🎉 Freitag!', body: 'Bevor das Wochenende startet — kurz die Woche abhaken?' },
  { title: '☀️ Samstags-Vibe', body: 'Wochenende und Ziele? Klingt nach einem guten Mix.' },
  { title: '🌙 Sonntagsplanung', body: 'Perfekter Tag um die neue Woche vorzubereiten!' },
]

// Deterministically pick a different message each day based on date
function getTodayMessage() {
  const now = new Date()
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000)
  // Mix day-of-year with day-of-week for variety
  const idx = (dayOfYear * 7 + now.getDay()) % MESSAGES.length
  return MESSAGES[idx]
}

export default async function handler(req, res) {
  const secret = req.headers['authorization']
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('subscription')

  if (error) return res.status(500).json({ error: error.message })
  if (!subs?.length) return res.status(200).json({ sent: 0 })

  const msg = getTodayMessage()
  const payload = JSON.stringify({ title: msg.title, body: msg.body, url: '/' })

  const results = await Promise.allSettled(
    subs.map(({ subscription }) =>
      webpush.sendNotification(subscription, payload)
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return res.status(200).json({ sent, total: subs.length })
}
