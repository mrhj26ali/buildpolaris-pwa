import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type DailyLogNode,
  type PunchItemNode,
  type SafetyIncidentNode,
  type SafetyStats,
  getDailyLogList,
  getPunchList,
  getSafetyIncidentList,
  getSafetyStatistics,
  getLocalDailyLogs,
  getLocalPunchItems,
  getLocalSafetyIncidents,
  createDailyLogOffline,
  createPunchItemOffline,
  createSafetyIncidentOffline,
} from '../api'
import { syncEngine } from '@/lib/sync/SyncEngine'
import { useProject } from '@/features/projects/ProjectContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, RefreshCw, CloudOff, Cloud } from 'lucide-react'

interface Props {
  projectId: string
}

export function FieldDashboard({ projectId }: Props) {
  const { t } = useTranslation()
  const [dailyLogs, setDailyLogs] = useState<DailyLogNode[]>([])
  const [punchItems, setPunchItems] = useState<PunchItemNode[]>([])
  const [incidents, setIncidents] = useState<SafetyIncidentNode[]>([])
  const [safetyStats, setSafetyStats] = useState<SafetyStats | null>(null)
  const [activeTab, setActiveTab] = useState<'logs' | 'punch' | 'safety'>('logs')
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showDailyLogForm, setShowDailyLogForm] = useState(false)
  const [showPunchForm, setShowPunchForm] = useState(false)
  const [showIncidentForm, setShowIncidentForm] = useState(false)

  useEffect(() => {
    loadData()
    const interval = setInterval(() => {
      syncEngine.getPendingCount().then(setPendingCount)
    }, 5000)
    return () => clearInterval(interval)
  }, [projectId])

  async function loadData() {
    if (!projectId) return
    setIsLoading(true)
    try {
      const [logs, punch, inc, stats, localLogs, localPunch, localInc] = await Promise.all([
        getDailyLogList(projectId).catch(() => []),
        getPunchList(projectId).catch(() => []),
        getSafetyIncidentList(projectId).catch(() => []),
        getSafetyStatistics(projectId).catch(() => null),
        getLocalDailyLogs(projectId),
        getLocalPunchItems(projectId),
        getLocalSafetyIncidents(projectId),
      ])
      
      setDailyLogs(logs)
      setPunchItems(punch)
      setIncidents(inc)
      setSafetyStats(stats)
      setPendingCount(localLogs.filter(l => !l.synced).length + 
                    localPunch.filter(p => !p.synced).length + 
                    localInc.filter(i => !i.synced).length)
    } catch (error) {
      console.error('Failed to load field data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Closed': return 'bg-green-100 text-green-800'
      case 'Submitted': return 'bg-green-100 text-green-800'
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Reported': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openPunchCount = punchItems.filter(p => p.status !== 'Closed').length

  return (
    <div className="space-y-4 p-4">
      {/* Sync Status Banner */}
      {pendingCount > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3">
          <div className="flex items-center gap-2">
            <CloudOff className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending sync
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncEngine.syncNow()}
              className="ml-auto"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Now
            </Button>
          </div>
        </div>
      )}

      {/* Safety Stats */}
      {safetyStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{safetyStats.total_incidents}</div>
            <div className="text-xs text-gray-500">Total Incidents</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{safetyStats.osha_recordable}</div>
            <div className="text-xs text-gray-500">OSHA Recordable</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{safetyStats.near_misses}</div>
            <div className="text-xs text-gray-500">Near Misses</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{safetyStats.lost_time}</div>
            <div className="text-xs text-gray-500">Lost Time</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{openPunchCount}</div>
            <div className="text-xs text-gray-500">Open Punch Items</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {(['logs', 'punch', 'safety'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'logs' ? `Daily Logs (${dailyLogs.length})` :
             tab === 'punch' ? `Punch List (${punchItems.length})` :
             `Safety (${incidents.length})`}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {activeTab === 'logs' && (
          <Button onClick={() => setShowDailyLogForm(!showDailyLogForm)} className="bg-brand-500">
            <Plus className="h-4 w-4 mr-2" />
            New Daily Log
          </Button>
        )}
        {activeTab === 'punch' && (
          <Button onClick={() => setShowPunchForm(!showPunchForm)} className="bg-brand-500">
            <Plus className="h-4 w-4 mr-2" />
            New Punch Item
          </Button>
        )}
        {activeTab === 'safety' && (
          <Button onClick={() => setShowIncidentForm(!showIncidentForm)} className="bg-brand-500">
            <Plus className="h-4 w-4 mr-2" />
            Report Incident
          </Button>
        )}
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Daily Log Form */}
      {showDailyLogForm && activeTab === 'logs' && (
        <DailyLogForm projectId={projectId} onClose={() => setShowDailyLogForm(false)} onSuccess={loadData} />
      )}

      {/* Punch Item Form */}
      {showPunchForm && activeTab === 'punch' && (
        <PunchItemForm projectId={projectId} onClose={() => setShowPunchForm(false)} onSuccess={loadData} />
      )}

      {/* Safety Incident Form */}
      {showIncidentForm && activeTab === 'safety' && (
        <SafetyIncidentForm projectId={projectId} onClose={() => setShowIncidentForm(false)} onSuccess={loadData} />
      )}

      {/* Daily Logs Tab */}
      {activeTab === 'logs' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weather</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workforce</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyLogs.map((log) => (
                <tr key={log.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.log_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.weather_conditions || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.workforce_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Punch List Tab */}
      {activeTab === 'punch' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {punchItems.map((item) => (
                <tr key={item.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.due_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Safety Incidents Tab */}
      {activeTab === 'safety' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OSHA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((inc) => (
                <tr key={inc.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inc.incident_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inc.incident_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inc.severity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {inc.osha_recordable ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Recordable</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Non-Recordable</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(inc.status)}`}>
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Daily Log Form Component
function DailyLogForm({ projectId, onClose, onSuccess }: { projectId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    log_date: new Date().toISOString().split('T')[0],
    weather: '',
    workforce_count: 0,
    work_performed: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createDailyLogOffline({
        ...form,
        project: projectId,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create daily log:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New Daily Log</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.log_date}
                onChange={(e) => setForm({ ...form, log_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Weather</Label>
              <Input
                value={form.weather}
                onChange={(e) => setForm({ ...form, weather: e.target.value })}
                placeholder="Sunny, 75°F"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Workforce Count</Label>
            <Input
              type="number"
              value={form.workforce_count}
              onChange={(e) => setForm({ ...form, workforce_count: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label>Work Performed</Label>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={form.work_performed}
              onChange={(e) => setForm({ ...form, work_performed: e.target.value })}
              placeholder="Describe work performed today..."
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-brand-500" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Daily Log'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Punch Item Form Component
function PunchItemForm({ projectId, onClose, onSuccess }: { projectId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'Medium',
    due_date: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createPunchItemOffline({
        ...form,
        project: projectId,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create punch item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New Punch Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g., Fix drywall crack in Room 204"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Room 204, 2nd Floor"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <select
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-brand-500" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Punch Item'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Safety Incident Form Component
function SafetyIncidentForm({ projectId, onClose, onSuccess }: { projectId: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    incident_type: 'Near Miss',
    severity: 'Low',
    description: '',
    osha_recordable: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createSafetyIncidentOffline({
        ...form,
        project: projectId,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create safety incident:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Report Safety Incident</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Incident Date</Label>
              <Input
                type="date"
                value={form.incident_date}
                onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Incident Type</Label>
              <select
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                value={form.incident_type}
                onChange={(e) => setForm({ ...form, incident_type: e.target.value })}
              >
                <option value="Near Miss">Near Miss</option>
                <option value="First Aid">First Aid</option>
                <option value="Recordable">Recordable</option>
                <option value="Lost Time">Lost Time</option>
                <option value="Fatality">Fatality</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Severity</Label>
              <select
                className="h-11 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>OSHA Recordable</Label>
              <div className="flex items-center gap-2 h-11">
                <input
                  type="checkbox"
                  checked={form.osha_recordable}
                  onChange={(e) => setForm({ ...form, osha_recordable: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-sm">Yes, this is OSHA recordable</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what happened, who was involved, and any immediate actions taken..."
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-brand-500" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Incident Report'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
