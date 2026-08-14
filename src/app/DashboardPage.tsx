import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProject } from '@/features/projects/ProjectContext'
import { useAuth } from '@/features/auth/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bffRequest } from '@/lib/clients/bffClient'
import { Calendar, AlertTriangle, CheckCircle, DollarSign, FileText, Clock } from 'lucide-react'

interface DashboardStats {
  open_tasks: number
  overdue_tasks: number
  open_rfis: number
  overdue_rfis: number
  open_punch_items: number
  pending_pay_apps: number
  total_budget: number
  committed_amount: number
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { projectId } = useProject()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    setIsLoading(true)
    
    bffRequest<DashboardStats>('/method/buildpolaris_bff.api.dashboard.get_dashboard_stats', {
      method: 'POST',
      body: JSON.stringify({ project: projectId }),
    })
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false))
  }, [projectId])

  if (!projectId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              {t('project.selectTitle')}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">
          {t('shell.nav.dashboard')}
        </h1>
        <p className="text-sm text-gray-500">
          Welcome back, {user?.fullName}
        </p>
      </div>

      {stats && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Calendar className="h-5 w-5 text-blue-600" />}
              label="Open Tasks"
              value={stats.open_tasks}
              color="blue"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              label="Overdue Items"
              value={stats.overdue_tasks + stats.overdue_rfis}
              color="red"
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              label="Punch Items"
              value={stats.open_punch_items}
              color="green"
            />
            <StatCard
              icon={<DollarSign className="h-5 w-5 text-purple-600" />}
              label="Committed"
              value={formatCurrency(stats.committed_amount)}
              color="purple"
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Communications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Open RFIs</span>
                  <span className="font-medium">{stats.open_rfis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Overdue RFIs</span>
                  <span className="font-medium text-red-600">{stats.overdue_rfis}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Budget</span>
                  <span className="font-medium">{formatCurrency(stats.total_budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Pay Apps</span>
                  <span className="font-medium">{stats.pending_pay_apps}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  }

  return (
    <Card className={colorClasses[color as keyof typeof colorClasses]}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}
