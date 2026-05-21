import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { analytics } from '#/lib/analytics'
import { Button } from '#/components/ui/button'

const KEY = 'st-cookie-consent'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(KEY)) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  function dismiss(value: 'accepted' | 'declined') {
    localStorage.setItem(KEY, value)
    if (value === 'accepted') analytics.optIn()
    else analytics.optOut()
    setShow(false)
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-border/60 bg-card/95 p-4 shadow-soft-lg backdrop-blur sm:p-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to keep you signed in and improve StoryTunes. See our{' '}
          <Link to="/privacy" className="text-rose hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="ghost" className="rounded-full" onClick={() => dismiss('declined')}>
            Decline
          </Button>
          <Button size="sm" className="rounded-full" onClick={() => dismiss('accepted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
