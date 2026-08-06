import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { BffApiError } from '@/lib/bffClient' // <-- CHANGED from apiClient

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) { // <-- ADDED TYPE for strict TS
      if (err instanceof BffApiError && err.serverMessage?.toLowerCase().includes('disabled')) {
        setError('Account is disabled. Please contact support.')
      } else {
        setError('Invalid credentials or account disabled.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-surface-card p-8 shadow-sm border border-surface-border">
        <h1 className="text-2xl font-bold text-brand-900 mb-6 text-center">BuildPolaris</h1>
        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-500" 
            required 
          />
 an
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm outline-none focus:border-brand-500" 
            required 
          />
          <button type="submit" className="w-full rounded-lg bg-brand-500 text-white py-2 text-sm font-medium hover:bg-brand-600 transition">
            Sign In
          </button>
        </div>
      </form>
    </div>
  )
}