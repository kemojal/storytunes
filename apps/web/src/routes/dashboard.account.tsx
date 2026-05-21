import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { deleteMyAccount, exportMyData } from '#/lib/server/fns'
import { signOut } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/dashboard/account')({ component: AccountPage })

function AccountPage() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)

  async function exportData() {
    setBusy('export')
    try {
      const data = await exportMyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'storytunes-data.json'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(null)
    }
  }

  async function deleteAccount() {
    setBusy('delete')
    try {
      await deleteMyAccount()
      await signOut()
      navigate({ to: '/' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <Link
          to="/dashboard"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to orders
        </Link>
        <h1 className="mt-3 font-display text-3xl">Account &amp; data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Control your personal data (GDPR).
        </p>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-soft">
        <h2 className="font-display text-lg">Export your data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Download a JSON copy of your account and orders.
        </p>
        <Button onClick={exportData} disabled={busy !== null} className="mt-4 rounded-full">
          {busy === 'export' ? 'Preparing…' : 'Download my data'}
        </Button>
      </section>

      <section className="rounded-2xl border border-destructive/40 bg-card/70 p-6 shadow-soft">
        <h2 className="font-display text-lg text-destructive">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently erase your account, orders, and generated songs. This can't be
          undone.
        </p>
        {!confirm ? (
          <Button
            variant="outline"
            onClick={() => setConfirm(true)}
            className="mt-4 rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            Delete my account
          </Button>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-medium">Are you sure?</span>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={busy !== null}
              className="rounded-full"
            >
              {busy === 'delete' ? 'Deleting…' : 'Yes, delete everything'}
            </Button>
            <Button variant="ghost" onClick={() => setConfirm(false)} className="rounded-full">
              Cancel
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
