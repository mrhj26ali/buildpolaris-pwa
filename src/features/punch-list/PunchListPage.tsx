import { useState } from 'react'
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePunchListItems, useCreatePunchListItem } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'

const punchListItemSchema = z.object({
  project: z.string().min(1, 'Project is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.string().optional(),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
})

type PunchListItemFormValues = z.infer<typeof punchListItemSchema>

const priorityOptions = ['Low', 'Medium', 'High', 'Critical']

export function PunchListPage() {
  const { data: items, isLoading } = usePunchListItems()
  const createItem = useCreatePunchListItem()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PunchListItemFormValues>({
    resolver: zodResolver(punchListItemSchema) as Resolver<PunchListItemFormValues>,
    defaultValues: {
      project: '',
      location: '',
      description: '',
      priority: 'Medium',
    },
  })

  const onSubmit: SubmitHandler<PunchListItemFormValues> = async (values) => {
    setErrorMessage(null)
    try {
      await createItem.mutateAsync(values)
      reset({
        project: '',
        location: '',
        description: '',
        priority: 'Medium',
      })
    } catch (err) {
      const message =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not create punch list item. Please try again.'
      setErrorMessage(message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">Punch List</h1>
        <p className="text-sm text-gray-500">Track defects and snag items for finishing works.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New punch list item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input id="project" {...register('project')} placeholder="PROJ-0001" />
              {errors.project && <p className="text-sm text-status-overdue">{errors.project.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="Floor 3, Room 302" />
              {errors.location && <p className="text-sm text-status-overdue">{errors.location.message}</p>}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                rows={3}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-status-overdue">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('priority')}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input id="assigned_to" {...register('assigned_to')} placeholder="user@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
            </div>

            {errorMessage && (
              <div className="lg:col-span-2 rounded-md border border-status-overdue/30 bg-status-overdue/10 p-3 text-sm text-status-overdue">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                <Plus size={16} className="mr-1.5" />
                {isSubmitting ? 'Creating...' : 'Create item'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All punch list items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading items...
            </div>
          ) : items?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Location</th>
                    <th className="py-3 pr-4">Description</th>
                    <th className="py-3 pr-4">Priority</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">{item.location}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.description}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.priority}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.status}</td>
                      <td className="py-3 pr-4 text-gray-700">{item.due_date ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
              No punch list items yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}