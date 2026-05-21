import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient, emailOtp, signIn } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

export const Route = createFileRoute('/sign-in')({ component: SignIn })

function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState<'email' | 'code'>('email')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function sendCode() {
    setLoading(true)
    setError(null)
    const { error } = await emailOtp.sendVerificationOtp({
      email,
      type: 'sign-in',
    })
    setLoading(false)
    if (error) return setError(error.message ?? 'Failed to send code')
    setStage('code')
  }

  async function verifyCode() {
    setLoading(true)
    setError(null)
    const { error } = await signIn.emailOtp({ email, otp: code })
    setLoading(false)
    if (error) return setError(error.message ?? 'Invalid code')
    navigate({ to: '/' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
            ♪
          </span>
          <span className="font-display text-lg font-semibold">StoryTunes</span>
        </Link>

        <div className="rounded-3xl border border-border/60 bg-card/80 p-7 shadow-soft">
          <h1 className="text-center font-display text-2xl">Welcome</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Sign in to start or track your song.
          </p>

          <div className="mt-7 space-y-4">
            {stage === 'email' ? (
              <div className="space-y-2.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <Button
                  className="w-full rounded-full"
                  onClick={sendCode}
                  disabled={loading || !email}
                >
                  {loading ? 'Sending…' : 'Email me a code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <Label htmlFor="code">6-digit code sent to {email}</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.3em]"
                />
                <Button
                  className="w-full rounded-full"
                  onClick={verifyCode}
                  disabled={loading || !code}
                >
                  {loading ? 'Verifying…' : 'Verify & sign in'}
                </Button>
                <button
                  type="button"
                  onClick={() => setStage('email')}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  Use a different email
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() =>
                authClient.signIn.social({
                  provider: 'google',
                  callbackURL: '/',
                })
              }
            >
              Continue with Google
            </Button>

            {error && (
              <p className="text-center text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  )
}
