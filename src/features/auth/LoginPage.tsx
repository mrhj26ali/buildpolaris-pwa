import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { BffApiError } from '@/lib/bffClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
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
        setError(err.status === 401 ? 'Invalid credentials.' : (err.serverMessage ?? 'Login failed.'))
      } else {
        setError('Login failed.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brand-900">BuildPolaris</CardTitle>
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@acme.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-brand-500 hover:bg-brand-600" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don't have a workspace?{' '}
              <Link to="/register" className="font-medium text-brand-500 hover:underline">Create one</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}