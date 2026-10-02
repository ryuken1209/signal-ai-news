import { useEffect, useState } from 'react'
import { subscribeToast } from '../../utils/toast'

export default function Toast() {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    return subscribeToast((msg) => setMessage(msg))
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 2800)
    return () => clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-line text-text-primary text-sm px-4 py-2.5 rounded-sm shadow-lg animate-[fadeIn_0.15s_ease-out]"
    >
      {message}
    </div>
  )
}
