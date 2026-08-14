import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { activateAccount, resendActivation } from './api'
import { useAuth } from './AuthContext'
import { BffApiError } from '@/lib/clients/bffClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type ActivationStatus = 'idle' | 'activated' | 'expired' | 'invalid' | 'resent'

export function ActivatePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const { t } = useTranslation()

  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [status, setStatus] = useState<ActivationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendEmail, setResendEmail] = useState('')

  async function activate(pwd?: string) {
    setError(null)
    setIsLoading(true)
    try {
      const res = await activateAccount(token, pwd)
      if (res.status === 'password_required') {
        setNeedsPassword(true)
        return
      }
      if (res.status === 'activated') {
        try {
          await refresh()
          navigate('/', { replace: true })
        } catch {
          setStatus('activated')
        }
        return
      }
      setStatus(res.status === 'expired' ? 'expired' : 'invalid')
    } catch (e: unknown) {
      if (e instanceof BffApiError && e.status === 400) {
        setStatus('expired')
      } else {
        setError(e instanceof Error ? e.message : t('auth.activate.failed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function requestNewLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await resendActivation(resendEmail)
      setStatus('resent')
    } catch (err: unknown) {
      if (err instanceof BffApiError && err.status === 429) {
        setError(t('auth.activate.rateLimited'))
      } else {
        setError(err instanceof Error ? err.message : t('auth.activate.failed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const showResend = status === 'expired' || status === 'invalid'

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-brand-900">{t('auth.activate.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'activated' && (
            <>
              <p className="text-sm text-green-700">{t('auth.activate.successFallback')}</p>
              <Link to="/login"><Button className="h-11 w-full bg-brand-500">{t('auth.activate.goToLogin')}</Button></Link>
            </>
          )}
          {status === 'resent' && <p className="text-sm text-green-700">{t('auth.activate.resent')}</p>}
          {showResend && (
            <>
              <p className="text-sm text-red-700">
                {status === 'expired' ? t('auth.activate.expired') : t('auth.activate.invalid')}
              </p>
              <form className="space-y-3" onSubmit={requestNewLink}>
                <div className="space-y-2">
                  <Label htmlFor="resend-email">{t('auth.activate.resendEmail')}</Label>
                  <Input id="resend-email" type="email" value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="h-11 w-full bg-brand-500" disabled={isLoading}>
                  {isLoading ? t('auth.activate.resending') : t('auth.activate.resendSubmit')}
                </Button>
              </form>
            </>
          )}
          {status === 'idle' && !needsPassword && (
            <Button className="h-11 w-full bg-brand-500" disabled={isLoading} onClick={() => void activate()}>
              {isLoading ? t('auth.activate.activating') : t('auth.activate.activate')}
            </Button>
          )}
          {status === 'idle' && needsPassword && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); void activate(password) }}>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.activate.choosePassword')}</Label>
                <Input id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              </div>
              <Button type="submit" className="h-11 w-full bg-brand-500" disabled={isLoading}>
                {isLoading ? t('auth.activate.activating') : t('auth.activate.setPassword')}
              </Button>
            </form>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
