import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { registerTenantRequest } from './api'
import { BffApiError } from '@/lib/clients/bffClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const COUNTRIES = ['United States', 'United Arab Emirates', 'Saudi Arabia', 'Egypt', 'United Kingdom', 'Germany', 'India']
const CURRENCIES = ['USD', 'AED', 'SAR', 'EGP', 'GBP', 'EUR', 'INR']

export function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    admin_name: '',
    admin_email: '',
    country: 'United States',
    currency: 'USD',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await registerTenantRequest(formData)
      navigate('/login', { state: { message: t('auth.register.success') } })
    } catch (err: unknown) {
      const message = err instanceof BffApiError
        ? (err.serverMessage ?? err.message)
        : err instanceof Error
          ? err.message
          : t('auth.register.failed')
      setError(message || t('auth.register.failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-900">{t('auth.register.title')}</CardTitle>
          <CardDescription>{t('auth.register.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="company_name">{t('auth.register.company')}</Label>
              <Input id="company_name" name="company_name" placeholder={t('auth.register.companyPlaceholder')}
                value={formData.company_name} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="country">{t('auth.register.country')}</Label>
                <select id="country" name="country" value={formData.country} onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-input bg-transparent px-2 text-sm">
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t('auth.register.currency')}</Label>
                <select id="currency" name="currency" value={formData.currency} onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-input bg-transparent px-2 text-sm">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_name">{t('auth.register.fullName')}</Label>
              <Input id="admin_name" name="admin_name" placeholder={t('auth.register.fullNamePlaceholder')}
                value={formData.admin_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">{t('auth.register.email')}</Label>
              <Input id="admin_email" name="admin_email" type="email" placeholder={t('auth.register.emailPlaceholder')}
                value={formData.admin_email} onChange={handleChange} required />
            </div>
            <Button type="submit" className="h-11 w-full bg-brand-500 hover:bg-brand-600" disabled={isLoading}>
              {isLoading ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {t('auth.register.hasAccount')}{' '}
              <Link to="/login" className="font-medium text-brand-500 hover:underline">{t('auth.register.signInLink')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
