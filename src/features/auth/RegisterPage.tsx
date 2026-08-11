import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_name: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    country: 'United States',
    currency: 'USD',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setFormData({ ...formData, [e.target.name]: e.target.value })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await registerTenantRequest(formData)
      navigate('/login', {
        state: { message: 'Workspace created! Check your email to activate your account, then log in.' },
      })
    } catch (err: unknown) {
      const message = err instanceof BffApiError
        ? (err.serverMessage ?? err.message)
        : err instanceof Error
          ? err.message
          : 'Unexpected error.'
      setError(message || 'Registration failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-900">Create Your Workspace</CardTitle>
          <CardDescription>You will be the Admin of this company and can invite your team afterwards.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-100 p-3 text-sm text-red-700">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="company_name">Company / Workspace Name</Label>
              <Input id="company_name" name="company_name" placeholder="Acme Construction LLC"
                value={formData.company_name} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select id="country" name="country" value={formData.country} onChange={handleChange}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm">
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select id="currency" name="currency" value={formData.currency} onChange={handleChange}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_name">Your Full Name</Label>
              <Input id="admin_name" name="admin_name" placeholder="John Doe"
                value={formData.admin_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">Work Email</Label>
              <Input id="admin_email" name="admin_email" type="email" placeholder="john@acme.com"
                value={formData.admin_email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_password">Password</Label>
              <Input id="admin_password" name="admin_password" type="password" placeholder="Min. 8 characters"
                value={formData.admin_password} onChange={handleChange} required minLength={8} />
            </div>
            <Button type="submit" className="w-full bg-brand-500 hover:bg-brand-600" disabled={isLoading}>
              {isLoading ? 'Creating Workspace...' : 'Create Workspace'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-brand-500 hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



