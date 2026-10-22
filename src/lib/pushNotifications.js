import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)))
}

export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push-Benachrichtigungen werden auf diesem Gerät nicht unterstützt.')
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Push-Konfiguration fehlt.')
  }

  // Bereits dauerhaft blockiert?
  if (Notification.permission === 'denied') {
    throw new Error('Benachrichtigungen sind blockiert. Bitte in den Browser-Einstellungen erlauben.')
  }

  const reg = await navigator.serviceWorker.register('/sw.js')

  // Nur anfragen wenn noch nicht granted
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Benachrichtigungen wurden nicht erlaubt.')
    }
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Nicht eingeloggt.')
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ subscription: sub.toJSON(), timezone }),
  })

  if (!res.ok) {
    if (res.status === 401) throw new Error('Session abgelaufen. Bitte neu einloggen.')
    if (res.status === 429) throw new Error('Zu viele Anfragen. Bitte kurz warten.')
    throw new Error('Registrierung fehlgeschlagen.')
  }

  return true
}

export async function isPushEnabled() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!reg) return false
  const sub = await reg.pushManager.getSubscription()
  return !!sub
}

export async function unregisterPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  if (!reg) return
  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
}
