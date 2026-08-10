import { useEffect, useState } from 'react';
import { listUsers, resendInvite, setUserEnabled } from './api';
import type { TenantUser } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { UserInviteModal } from './ui/UserInviteModal';
import { UserEditModal } from './ui/UserEditModal';
import { UserListTable } from './ui/UserListTable';
import { HistoryDrawer } from './ui/HistoryDrawer';

export function UsersPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<TenantUser | null>(null);
  const [historyUser, setHistoryUser] = useState<TenantUser | null>(null);

  const reload = async () => setUsers(await listUsers());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, []);

  const handleResend = async (email: string) => {
    await resendInvite(email);
    alert('Invite re-sent. The previous link is now invalid.');
  };

  const handleToggleEnabled = async (u: TenantUser) => {
    if (!confirm(u.enabled ? `Disable ${u.full_name}?` : `Enable ${u.full_name}?`)) return;
    try {
      await setUserEnabled(u.email, !u.enabled);
      await reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">User Management</h1>
          <p className="text-sm text-gray-500">Invite your team and assign their roles.</p>
        </div>
        <Button className="bg-brand-500" onClick={() => setInviteOpen(true)}>
          <Mail size={14} className="mr-2" /> Invite User
        </Button>
      </div>
      
      <Card>
        <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
        <CardContent>
          <UserListTable 
            users={users} 
            onEdit={setEditUser} 
            onResend={handleResend} 
            onToggleEnabled={handleToggleEnabled} 
            onViewHistory={setHistoryUser} 
          />
        </CardContent>
      </Card>

      {inviteOpen && (
        <UserInviteModal 
          onClose={() => setInviteOpen(false)} 
          onSuccess={() => { setInviteOpen(false); reload(); }} 
        />
      )}

      {editUser && (
        <UserEditModal 
          user={editUser} 
          onClose={() => setEditUser(null)} 
          onSuccess={() => { setEditUser(null); reload(); }} 
        />
      )}

      {historyUser && (
        <HistoryDrawer 
          doctype="User" 
          name={historyUser.email} 
          title={`History — ${historyUser.full_name}`} 
          onClose={() => setHistoryUser(null)} 
        />
      )}
    </div>
  );
}