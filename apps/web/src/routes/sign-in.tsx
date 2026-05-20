import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
    <div className="mx-auto mt-24 max-w-sm space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in to StoryTunes</h1>

      {stage === 'email' ? (
        <div className="space-y-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Button className="w-full" onClick={sendCode} disabled={loading || !email}>
            Email me a code
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="code">Enter the 6-digit code sent to {email}</Label>
          <Input
            id="code"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />
          <Button className="w-full" onClick={verifyCode} disabled={loading || !code}>
            Verify &amp; sign in
          </Button>
        </div>
      )}

      <div className="relative text-center text-sm text-muted-foreground">or</div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          authClient.signIn.social({ provider: 'google', callbackURL: '/' })
        }
      >
        Continue with Google
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
