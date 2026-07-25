import { useMemo, useState } from 'react'
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateTask } from './hooks'
import { ApiError } from '@/lib/apiClient'
import type { TaskRecord } from './types'

const taskSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  status: z.string().min(1, 'Status is required'),
  priority: z.string().min(1, 'Priority is required'),
  type: z.string().min(1, 'Type is required'),
  exp_start_date: z.string().min(1, 'Start date is required'),
  exp_end_date: z.string().min(1, 'End date is required'),
  progress: z.coerce.number().min(0, 'Progress must be 0 or more').max(100, 'Progress must be at most 100'),
  is_milestone: z.boolean(),
  is_group: z.boolean(),
  parent_task: z.string().optional(),
  task_weight: z.coerce.number().min(0, 'Task weight must be 0 or more'),
})

interface NewTaskDialogProps {
  projectId: string
  ancestors: TaskRecord[]
  onCreated: () => void
}

type NewTaskFormValues = z.infer<typeof taskSchema>

const statusOptions = ['Open', 'Working', 'Pending Review', 'Overdue', 'Completed', 'Cancelled']
const priorityOptions = ['Low', 'Medium', 'High']
const typeOptions = ['Tiling', 'Painting', 'Plastering', 'Blockwork', 'Other']

export function NewTaskDialog({ projectId, ancestors, onCreated }: NewTaskDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createTask = useCreateTask(projectId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewTaskFormValues>({
    resolver: zodResolver(taskSchema) as Resolver<NewTaskFormValues>,
    defaultValues: {
      status: 'Open',
      priority: 'Medium',
      type: 'Other',
      progress: 0,
      is_milestone: false,
      is_group: false,
      task_weight: 1,
    },
  })

  const parentTaskOptions = useMemo(
    () => [{ name: '', subject: 'No parent task' }, ...ancestors],
    [ancestors]
  )

  const onSubmit: SubmitHandler<NewTaskFormValues> = async (values) => {
    setErrorMessage(null)
    try {
      await createTask.mutateAsync({
        ...values,
        is_milestone: values.is_milestone ? 1 : 0,
        is_group: values.is_group ? 1 : 0,
      })
      reset()
      onCreated()
    } catch (err) {
      const message =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not create task. Please try again.'
      setErrorMessage(message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" {...register('subject')} />
              {errors.subject && <p className="text-sm text-status-overdue">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('status')}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              {errors.status && <p className="text-sm text-status-overdue">{errors.status.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('priority')}
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              {errors.priority && <p className="text-sm text-status-overdue">{errors.priority.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Trade</Label>
              <select
                id="type"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('type')}
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <p className="text-sm text-status-overdue">{errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp_start_date">Expected start date</Label>
              <Input id="exp_start_date" type="date" {...register('exp_start_date')} />
              {errors.exp_start_date && <p className="text-sm text-status-overdue">{errors.exp_start_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp_end_date">Expected end date</Label>
              <Input id="exp_end_date" type="date" {...register('exp_end_date')} />
              {errors.exp_end_date && <p className="text-sm text-status-overdue">{errors.exp_end_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress</Label>
              <Input id="progress" type="number" min={0} max={100} step={1} {...register('progress', { valueAsNumber: true })} />
              {errors.progress && <p className="text-sm text-status-overdue">{errors.progress.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task_weight">Task weight</Label>
              <Input id="task_weight" type="number" min={0} step={1} {...register('task_weight', { valueAsNumber: true })} />
              {errors.task_weight && <p className="text-sm text-status-overdue">{errors.task_weight.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_task">Parent task</Label>
              <select
                id="parent_task"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('parent_task')}
              >
                {parentTaskOptions.map((task) => (
                  <option key={task.name} value={task.name}>{task.subject}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('is_milestone')} className="h-4 w-4 rounded border border-input text-brand-500" />
                  Milestone
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" {...register('is_group')} className="h-4 w-4 rounded border border-input text-brand-500" />
                  Group task
                </label>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-3 text-sm text-status-overdue">
              {errorMessage}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating task...' : 'Create task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
