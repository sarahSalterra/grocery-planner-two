// ─── Grocery Planner Service Worker ──────────────────────────────────────────
// Handles notification click events so tapping a notification opens the right
// page in the app, even when the tab is in the background or closed.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()))

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data ?? {}

  // Default URL from notification data; action buttons may override it
  let targetUrl = data.url ?? '/'
  if (event.action && data.actions?.[event.action]?.url) {
    targetUrl = data.actions[event.action].url
  }

  // Ensure target is a full URL so navigate() works correctly
  const fullUrl = targetUrl.startsWith('http')
    ? targetUrl
    : self.location.origin + targetUrl

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Prefer an existing window for this origin
        const existing = windowClients.find((c) =>
          c.url.startsWith(self.location.origin)
        )
        if (existing) {
          existing.focus()
          return existing.navigate(fullUrl)
        }
        return clients.openWindow(fullUrl)
      })
  )
})
