// Event bus for the toast notification system.
// Kept in a dedicated utility file so Toast.jsx only exports React components,
// ensuring Vite Fast Refresh (HMR) functions properly without full-page reloads.

let listeners = []

export function notify(message) {
  listeners.forEach((fn) => fn(message))
}

export function subscribeToast(handler) {
  listeners.push(handler)
  return () => {
    listeners = listeners.filter((l) => l !== handler)
  }
}
