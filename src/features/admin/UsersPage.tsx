import { useEffect, useMemo, useState } from 'react'
import {
  availableRoles, inviteUser, listUsers, resendInvite, setUserEnabled, updateUserRoles,
} from './api'
import type { PlatformRole, TenantUser } from '@/types/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HistoryDrawer } from './components/HistoryDrawer'
import { Mail, Pencil, RefreshCw, ShieldCheck } from 'lucide-react'

function RoleCheckboxes({
  roles, selected, onToggle,
}: { roles: PlatformRole[]; selected: string[]; onToggle: (role: string) => void }) {
  return (
    <div className="space-y-2">
      {roles.map((r) => (
        <label
          key={r.role}
          className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 transition-colors hover:bg-brand-50 ${
            selected.includes(r.role) ? 'border-brand-500 bg-brand-50' : 'border-surface-border'
          }`}
        >
          <input
            type="checkbox"
            className="mt-1"
            checked={selected.includes(r.role)}
            onChange={() => onToggle(r.role)}
          />
          <span>
            <span className="block text-sm font-medium">{r.role.replace('BuildPolaris ', '')}</span>
            <span className="block text-xs text-gray-500">{r.description}</span>
          </span>
        </label>
      ))}
    </div>
  )
}

export function UsersPage() {
  const [users, setUsers] = useState<TenantUser[]>([])
  const [roles, setRoles] = useState<PlatformRole[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editUser, setEditUser] = useState<TenantUser | null>(null)
  const [historyUser, setHistoryUser] = useState<TenantUser | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [form, setForm] = useState({ email: '', full_name: '' })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function reload() {
    setUsers(await listUsers())
  }

  useEffect(() => {
    reload()
    availableRoles().then(setRoles)
  }, [])

  const toggleRole = (role: string) =>
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setBusy(true)
    try {
      await inviteUser(form.email, form.full_name, selectedRoles)
      setInviteOpen(false)
      setForm({ email: '', full_name: '' })
      setSelectedRoles([])
      await reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invite failed.')
    } finally {
      setBusy(false)
    }
  }

  async function submitEditRoles(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setError(null); setBusy(true)
    try {
      await updateUserRoles(editUser.email, selectedRoles)
      setEditUser(null)
      setSelectedRoles([])
      await reload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed.')
    } finally {
      setBusy(false)
    }
  }

  async function handleResend(email: string) {
    await resendInvite(email)
    alert('Invite re-sent. The previous link is now invalid.')
  }

  async function handleToggleEnabled(u: TenantUser) {
    if (!confirm(u.enabled ? `Disable ${u.full_name}?` : `Enable ${u.full_name}?`)) return
    try {
      await setUserEnabled(u.email, !u.enabled)
      await reload()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed.')
    }
  }

  const statusOf = useMemo(() => (u: TenantUser) => {
    if (!u.enabled && !u.bp_invite_status) return 'Disabled'
    if (u.bp_invite_status === 'Pending') return 'Pending Invite'
    if (!u.enabled) return 'Disabled'
    return 'Active'
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">User Management</h1>
          <p className="text-sm text-gray-500">Invite your team and assign their roles (UC-02 / UC-07).</p>
        </div>
        <Button className="bg-brand-500" onClick={() => { setInviteOpen(true); setError(null) }}>
          <Mail size={14} /> Invite User
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-gray-500">
                <th className="py-2">Name</th><th>Email</th><th>Roles</th><th>Status</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-b border-surface-border">
                  <td className="py-2">{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className="rounded bg-brand-50 px-1.5 py-0.5 text-xs text-brand-600">
                          {r.replace('BuildPolaris ', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={statusOf(u) === 'Active' ? 'text-status-ontrack' : statusOf(u) === 'Disabled' ? 'text-status-overdue' : 'text-status-atrisk'}>
                      {statusOf(u)}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button title="Edit roles" className="p-1 hover:bg-brand-50"
                        onClick={() => { setEditUser(u); setSelectedRoles(u.roles); setError(null) }}>
                        <Pencil size={14} />
                      </button>
                      {u.bp_invite_status === 'Pending' && (
                        <button title="Resend invite" className="p-1 hover:bg-brand-50" onClick={() => handleResend(u.email)}>
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button title="Enable/Disable" className="p-1 hover:bg-brand-50" onClick={() => handleToggleEnabled(u)}>
                        <ShieldCheck size={14} />
                      </button>
                      <button title="View audit history (UC-06)" className="text-xs text-brand-500 hover:underline"
                        onClick={() => setHistoryUser(u)}>
                        History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ───────────────── Invite User Modal (FIXED LAYOUT) ───────────────── */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <Card className="flex max-h-[90vh] w-full max-w-lg flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">Invite User</CardTitle>
            </CardHeader>
            <form onSubmit={submitInvite} className="flex min-h-0 flex-1 flex-col">
              {/* Scrollable body */}
              <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Roles (check all that apply)</Label>
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    <RoleCheckboxes roles={roles} selected={selectedRoles} onToggle={toggleRole} />
                  </div>
                </div>
              </CardContent>
              {/* Pinned footer — buttons ALWAYS visible */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-surface-border px-6 py-4">
                <span className="text-xs text-gray-500">
                  {selectedRoles.length} role{selectedRoles.length === 1 ? '' : 's'} selected
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-brand-500" disabled={busy || selectedRoles.length === 0}>
                    {busy ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ───────────────── Edit Roles Modal (same fixed layout) ───────────────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <Card className="flex max-h-[90vh] w-full max-w-lg flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">Edit roles — {editUser.full_name}</CardTitle>
            </CardHeader>
            <form onSubmit={submitEditRoles} className="flex min-h-0 flex-1 flex-col">
              <CardContent className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-2">
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  <RoleCheckboxes roles={roles} selected={selectedRoles} onToggle={toggleRole} />
                </div>
              </CardContent>
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-surface-border px-6 py-4">
                <span className="text-xs text-gray-500">
                  {selectedRoles.length} role{selectedRoles.length === 1 ? '' : 's'} selected
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                  <Button type="submit" className="bg-brand-500" disabled={busy || selectedRoles.length === 0}>
                    {busy ? 'Saving...' : 'Save Roles'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {historyUser && (
        <HistoryDrawer doctype="User" name={historyUser.email} title={`History — ${historyUser.full_name}`}
          onClose={() => setHistoryUser(null)} />
      )}
    </div>
  )
}