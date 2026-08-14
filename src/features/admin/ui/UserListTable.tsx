import { useTranslation } from 'react-i18next'
import type { TenantUser } from '@/types/auth'
import { Pencil, RefreshCw, ShieldCheck } from 'lucide-react'

interface Props {
  users: TenantUser[]
  onEdit: (user: TenantUser) => void
  onResend: (email: string) => void
  onToggleEnabled: (user: TenantUser) => void
  onViewHistory: (user: TenantUser) => void
}

export function UserListTable({ users, onEdit, onResend, onToggleEnabled, onViewHistory }: Props) {
  const { t } = useTranslation()

  function getStatusKey(u: TenantUser): string {
    if (!u.enabled && !u.bp_invite_status) return 'admin.users.statusDisabled'
    if (u.bp_invite_status === 'Pending') return 'admin.users.statusPending'
    if (!u.enabled) return 'admin.users.statusDisabled'
    return 'admin.users.statusActive'
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-surface-border text-left text-gray-500">
          <th className="py-2">{t('admin.users.name')}</th>
          <th>{t('admin.users.email')}</th>
          <th>{t('admin.users.roles')}</th>
          <th>{t('admin.users.status')}</th>
          <th className="text-right">{t('admin.users.actions')}</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const statusKey = getStatusKey(u)
          const tone =
            statusKey === 'admin.users.statusActive'
              ? 'text-status-ontrack'
              : statusKey === 'admin.users.statusDisabled'
                ? 'text-status-overdue'
                : 'text-status-atrisk'
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
              <td><span className={tone}>{t(statusKey)}</span></td>
              <td>
                <div className="flex items-center justify-end gap-1">
                  <button title={t('admin.users.editRoles')} aria-label={t('admin.users.editRoles')}
                    className="min-h-11 min-w-11 p-1 hover:bg-brand-50" onClick={() => onEdit(u)}>
                    <Pencil size={14} />
                  </button>
                  {u.bp_invite_status === 'Pending' && (
                    <button title={t('admin.users.resendInvite')} aria-label={t('admin.users.resendInvite')}
                      className="min-h-11 min-w-11 p-1 hover:bg-brand-50" onClick={() => onResend(u.email)}>
                      <RefreshCw size={14} />
                    </button>
                  )}
                  <button title={t('admin.users.toggleEnabled')} aria-label={t('admin.users.toggleEnabled')}
                    className="min-h-11 min-w-11 p-1 hover:bg-brand-50" onClick={() => onToggleEnabled(u)}>
                    <ShieldCheck size={14} />
                  </button>
                  <button className="min-h-11 text-xs text-brand-500 hover:underline" onClick={() => onViewHistory(u)}>
                    {t('admin.users.history')}
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
