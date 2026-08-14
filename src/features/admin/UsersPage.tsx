import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { listUsers, resendInvite, setUserEnabled } from './api'
import type { TenantUser } from '@/types/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Mail } from 'lucide-react'
import { UserInviteModal } from './ui/UserInviteModal'
import { UserEditModal } from './ui/UserEditModal'
import { UserListTable } from './ui/UserListTable'
import { HistoryDrawer } from './ui/HistoryDrawer'

interface Notice {
  tone: 'info' | 'error'
  text: string
}

export function UsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<TenantUser[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editUser, setEditUser] = useState<TenantUser | null>(null)
  const [historyUser, setHistoryUser] = useState<TenantUser | null>(null)
  const [pendingToggle, setPendingToggle] = useState<TenantUser | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  async function reload() {
    setUsers(await listUsers())
  }

  useEffect(() => {
    let cancelled = false
    listUsers()
      .then((data) => { if (!cancelled) setUsers(data) })
      .catch(() => { if (!cancelled) setNotice({ tone: 'error', text: t('admin.users.actionFailed') }) })
    return () => { cancelled = true }
  }, [t])

  async function handleResend(email: string) {
    try {
      await resendInvite(email)
      setNotice({ tone: 'info', text: t('admin.users.inviteResent') })
    } catch (err: unknown) {
      setNotice({ tone: 'error', text: err instanceof Error ? err.message : t('admin.users.actionFailed') })
    }
  }

  async function confirmToggle(target: TenantUser) {
    setPendingToggle(null)
    try {
      await setUserEnabled(target.email, !target.enabled)
      await reload()
    } catch (err: unknown) {
      setNotice({ tone: 'error', text: err instanceof Error ? err.message : t('admin.users.actionFailed') })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">{t('admin.users.title')}</h1>
          <p className="text-sm text-gray-500">{t('admin.users.subtitle')}</p>
        </div>
        <Button className="h-11 bg-brand-500" onClick={() => setInviteOpen(true)}>
          <Mail size={14} className="mr-2" /> {t('admin.users.invite')}
        </Button>
      </div>

      {notice && (
        <div
          className={`rounded-md border p-3 text-sm ${
            notice.tone === 'error'
              ? 'border-red-200 bg-red-100 text-red-700'
              : 'border-green-200 bg-green-100 text-green-700'
          }`}
        >
          {notice.text}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">{t('admin.users.team')}</CardTitle></CardHeader>
        <CardContent>
          <UserListTable
            users={users}
            onEdit={setEditUser}
            onResend={(email) => void handleResend(email)}
            onToggleEnabled={setPendingToggle}
            onViewHistory={setHistoryUser}
          />
        </CardContent>
      </Card>

      <AlertDialog open={pendingToggle !== null} onOpenChange={(open) => { if (!open) setPendingToggle(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.enabled ? t('admin.users.disableTitle') : t('admin.users.enableTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.enabled
                ? t('admin.users.disableConfirm', { name: pendingToggle.full_name })
                : t('admin.users.enableConfirm', { name: pendingToggle?.full_name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingToggle) void confirmToggle(pendingToggle) }}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {inviteOpen && (
        <UserInviteModal
          onClose={() => setInviteOpen(false)}
          onSuccess={() => { setInviteOpen(false); void reload() }}
        />
      )}
      {editUser && (
        <UserEditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => { setEditUser(null); void reload() }}
        />
      )}
      {historyUser && (
        <HistoryDrawer
          doctype="User"
          name={historyUser.email}
          title={`${t('admin.users.history')} — ${historyUser.full_name}`}
          onClose={() => setHistoryUser(null)}
        />
      )}
    </div>
  )
}
