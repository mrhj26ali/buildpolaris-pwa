import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { activateAccount } from './api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function ActivatePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'activated' | 'expired' | 'invalid'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function activate(pwd?: string) {
    setError(null)
    setIsLoading(true)
    try {
      const res = await activateAccount(token, pwd)
      if (res.status === 'password_required') setNeedsPassword(true)
      else if (res.status === 'activated') setStatus('activated')
      else if (res.status === 'expired') setStatus('expired')
      else setStatus('invalid')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Activation failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-brand-900">Account Activation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'activated' && (
            <>
              <p className="text-sm text-green-700">Your account is active. You can now sign in.</p>
              <Link to="/login"><Button className="w-full bg-brand-500">Go to Login</Button></Link>
            </>
          )}
          {status === 'expired' && <p className="text-sm text-red-700">This link has expired. Ask your admin to re-invite you, or use "resend activation" on login.</p>}
          {status === 'invalid' && <p className="text-sm text-red-700">Invalid activation link.</p>}
          {status === 'idle' && !needsPassword && (
            <Button className="w-full bg-brand-500" disabled={isLoading} onClick={() => activate()}>
              {isLoading ? 'Activating...' : 'Activate my account'}
            </Button>
          )}
          {status === 'idle' && needsPassword && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); activate(password) }}>
              <div className="space-y-2">
                <Label htmlFor="password">Choose a password</Label>
                <Input id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              </div>
              <Button type="submit" className="w-full bg-brand-500" disabled={isLoading}>
                {isLoading ? 'Activating...' : 'Set password & activate'}
              </Button>
            </form>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}