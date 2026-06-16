self.addEventListener('push', (event) => {
  let payload = {}

  try {
    payload = event.data ? event.data.json() : {}
  } catch (_) {
    payload = {}
  }

  const notification = payload.notification || {}
  const data = payload.data || {}
  const title = notification.title || data.title || 'Gadget Restore'
  const options = {
    body: notification.body || data.body || 'You have a new order update.',
    icon: notification.icon || data.icon || '/gadget-restore-logo.svg',
    badge: notification.badge || data.badge || '/gadget-restore-logo.svg',
    data: {
      click_action: data.click_action || data.link || '/notifications',
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.click_action || '/notifications'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.includes(targetUrl))

      if (existingClient) {
        return existingClient.focus()
      }

      return self.clients.openWindow(targetUrl)
    }),
  )
})
