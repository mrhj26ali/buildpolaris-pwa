import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './AuthContext'
import { BffApiError } from '@/lib/clients/bffClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { t } = useTranslation()

  const successMessage = (location.state as { message?: string } | null)?.message
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof BffApiError) {
        setError(err.status === 401 ? t('auth.login.invalid') : (err.serverMessage ?? t('auth.login.failed')))
      } else {
        setError(t('auth.login.failed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-900">{t('auth.login.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <div className="rounded-md border border-green-200 bg-green-100 p-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input id="email" type="email" placeholder={t('auth.login.emailPlaceholder')} value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Input id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="h-11 w-full bg-brand-500 hover:bg-brand-600" disabled={isLoading}>
              {isLoading ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="font-medium text-brand-500 hover:underline">{t('auth.login.registerLink')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
