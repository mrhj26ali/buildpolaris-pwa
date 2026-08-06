import { useState } from 'react'
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProjectRequests, useCreateProjectRequest } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'

const projectRequestSchema = z.object({
  request_type: z.string().min(1, 'Request type is required'),
  project: z.string().min(1, 'Project is required'),
  task: z.string().optional(),
  requester: z.string().min(1, 'Requester is required'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  cost_impact: z.coerce.number().optional(),
  schedule_impact_days: z.coerce.number().optional(),
})

type ProjectRequestFormValues = z.infer<typeof projectRequestSchema>

const requestTypeOptions = ['RFI', 'Submittal', 'Change Order']

export function RequestsPage() {
  const { data: requests, isLoading } = useProjectRequests()
  const createRequest = useCreateProjectRequest()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectRequestFormValues>({
    resolver: zodResolver(projectRequestSchema) as Resolver<ProjectRequestFormValues>,
    defaultValues: {
      request_type: 'RFI',
      project: '',
      requester: '',
      subject: '',
    },
  })

  const onSubmit: SubmitHandler<ProjectRequestFormValues> = async (values) => {
    setErrorMessage(null)
    try {
      await createRequest.mutateAsync(values)
      reset({
        request_type: 'RFI',
        project: '',
        requester: '',
        subject: '',
      })
    } catch (err) {
      const message =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not create request. Please try again.'
      setErrorMessage(message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">Project Requests</h1>
        <p className="text-sm text-gray-500">Manage RFIs, Submittals, and Change Orders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type</Label>
              <select
                id="request_type"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('request_type')}
              >
                {requestTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input id="project" {...register('project')} placeholder="PROJ-0001" />
              {errors.project && <p className="text-sm text-status-overdue">{errors.project.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task">Task (Optional)</Label>
              <Input id="task" {...register('task')} placeholder="TASK-0001" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requester">Requester</Label>
              <Input id="requester" {...register('requester')} placeholder="user@example.com" />
              {errors.requester && <p className="text-sm text-status-overdue">{errors.requester.message}</p>}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register('subject')} />
              {errors.subject && <p className="text-sm text-status-overdue">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                rows={4}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_impact">Cost Impact ($)</Label>
              <Input
                id="cost_impact"
                type="number"
                step="0.01"
                {...register('cost_impact', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule_impact_days">Schedule Impact (Days)</Label>
              <Input
                id="schedule_impact_days"
                type="number"
                {...register('schedule_impact_days', { valueAsNumber: true })}
              />
            </div>

            {errorMessage && (
              <div className="lg:col-span-2 rounded-md border border-status-overdue/30 bg-status-overdue/10 p-3 text-sm text-status-overdue">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                <Plus size={16} className="mr-1.5" />
                {isSubmitting ? 'Creating...' : 'Create request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading requests...
            </div>
          ) : requests?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Subject</th>
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">{req.request_type}</td>
                      <td className="py-3 pr-4 text-gray-700">{req.subject}</td>
                      <td className="py-3 pr-4 text-gray-700">{req.project}</td>
                      <td className="py-3 pr-4 text-gray-700">{req.status}</td>
                      <td className="py-3 pr-4 text-gray-700">{new Date(req.creation).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
              No requests yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}