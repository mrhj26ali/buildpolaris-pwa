import type { TenantUser } from '@/types/auth';
import { Pencil, RefreshCw, ShieldCheck } from 'lucide-react';

interface Props {
  users: TenantUser[];
  onEdit: (user: TenantUser) => void;
  onResend: (email: string) => void;
  onToggleEnabled: (user: TenantUser) => void;
  onViewHistory: (user: TenantUser) => void;
}

function getStatus(u: TenantUser) {
  if (!u.enabled && !u.bp_invite_status) return 'Disabled';
  if (u.bp_invite_status === 'Pending') return 'Pending Invite';
  if (!u.enabled) return 'Disabled';
  return 'Active';
}

export function UserListTable({ users, onEdit, onResend, onToggleEnabled, onViewHistory }: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-surface-border text-left text-gray-500">
          <th className="py-2">Name</th>
          <th>Email</th>
          <th>Roles</th>
          <th>Status</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const status = getStatus(u);
          return (
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
                <span className={status === 'Active' ? 'text-status-ontrack' : status === 'Disabled' ? 'text-status-overdue' : 'text-status-atrisk'}>
                  {status}
                </span>
              </td>
              <td>
                <div className="flex justify-end gap-1">
                  <button title="Edit roles" className="p-1 hover:bg-brand-50" onClick={() => onEdit(u)}>
                    <Pencil size={14} />
                  </button>
                  {u.bp_invite_status === 'Pending' && (
                    <button title="Resend invite" className="p-1 hover:bg-brand-50" onClick={() => onResend(u.email)}>
                      <RefreshCw size={14} />
                    </button>
                  )}
                  <button title="Enable/Disable" className="p-1 hover:bg-brand-50" onClick={() => onToggleEnabled(u)}>
                    <ShieldCheck size={14} />
                  </button>
                  <button title="View audit history" className="text-xs text-brand-500 hover:underline" onClick={() => onViewHistory(u)}>
                    History
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}