self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'TodoKalender'
  const options = {
    body: data.body || 'Zeit deine Ziele einzutragen!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'daily-reminder',
    renotify: true,
    data: { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
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
