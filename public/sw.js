self.addEventListener('push', function(event) {
  try {
    const data = event.data ? event.data.json() : {}

    // Payload-Validierung
    const title = typeof data.title === 'string' && data.title.length <= 100
      ? data.title
      : 'TodoKalender'
    const body = typeof data.body === 'string' && data.body.length <= 300
      ? data.body
      : 'Zeit deine Ziele einzutragen!'
    // Nur interne relative URLs erlauben
    const url = typeof data.url === 'string' && /^\/[a-zA-Z0-9/_-]*$/.test(data.url)
      ? data.url
      : '/'

    // Todo-spezifische Erinnerungen bekommen einen eigenen Tag damit sie tägliche nicht ersetzen
    const tag = typeof data.tag === 'string' && data.tag.startsWith('todo-reminder-')
      ? data.tag
      : 'daily-reminder'

    const options = {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag,
      renotify: true,
      data: { url },
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch (e) {
    console.error('Push notification error:', e)
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(event.notification.data?.url || '/')
    })
  )
})
