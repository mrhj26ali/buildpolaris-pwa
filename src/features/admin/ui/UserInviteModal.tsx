import { useState } from 'react';
import { availableRoles, inviteUser } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PlatformRole } from '@/types/auth';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function UserInviteModal({ onClose, onSuccess }: Props) {
  const [roles, setRoles] = useState<PlatformRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [form, setForm] = useState({ email: '', full_name: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useState(() => { availableRoles().then(setRoles).catch(console.error); });

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await inviteUser(form.email, form.full_name, selectedRoles);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invite failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="flex max-h-[90vh] w-full max-w-lg flex-col">
        <CardHeader className="shrink-0"><CardTitle className="text-base">Invite User</CardTitle></CardHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <CardContent className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {roles.map(r => (
                  <label key={r.role} className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 ${selectedRoles.includes(r.role) ? 'border-brand-500 bg-brand-50' : 'border-surface-border'}`}>
                    <input type="checkbox" className="mt-1" checked={selectedRoles.includes(r.role)} onChange={() => toggleRole(r.role)} />
                    <span>
                      <span className="block text-sm font-medium">{r.role.replace('BuildPolaris ', '')}</span>
                      <span className="block text-xs text-gray-500">{r.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-surface-border px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-brand-500" disabled={busy || selectedRoles.length === 0}>
              {busy ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}



