import { useState } from 'react'
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDailyLogs, useCreateDailyLog } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'

const dailyLogSchema = z.object({
  task: z.string().min(1, 'Task is required'),
  site_engineer: z.string().min(1, 'Site engineer is required'),
  log_date: z.string().min(1, 'Log date is required'),
  quantity_completed: z.coerce.number().min(0).optional(),
  crew_size: z.coerce.number().min(1).optional(),
  crew_experience_years: z.coerce.number().min(0).optional(),
  hours_worked: z.coerce.number().min(0).max(24).optional(),
  weather_condition: z.string().optional(),
  execution_quality_score: z.coerce.number().min(1).max(3).optional(),
})

type DailyLogFormValues = z.infer<typeof dailyLogSchema>

const weatherOptions = ['Clear', 'Rain', 'Extreme Heat', 'Wind', 'Hot', 'Cold', 'Warm', 'Other']

export function DailyLogPage() {
  const { data: logs, isLoading } = useDailyLogs()
  const createLog = useCreateDailyLog()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DailyLogFormValues>({
    resolver: zodResolver(dailyLogSchema) as Resolver<DailyLogFormValues>,
    defaultValues: {
      task: '',
      site_engineer: '',
      log_date: new Date().toISOString().slice(0, 10),
      weather_condition: 'Clear',
    },
  })

  const onSubmit: SubmitHandler<DailyLogFormValues> = async (values) => {
    setErrorMessage(null)
    try {
      await createLog.mutateAsync(values)
      reset({
        task: '',
        site_engineer: '',
        log_date: new Date().toISOString().slice(0, 10),
        weather_condition: 'Clear',
      })
    } catch (err) {
      const message =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not create daily log. Please try again.'
      setErrorMessage(message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">Daily Logs</h1>
        <p className="text-sm text-gray-500">Capture field data for AI productivity predictions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New daily log</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task">Task</Label>
              <Input id="task" {...register('task')} placeholder="TASK-0001" />
              {errors.task && <p className="text-sm text-status-overdue">{errors.task.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_engineer">Site Engineer</Label>
              <Input id="site_engineer" {...register('site_engineer')} placeholder="engineer@example.com" />
              {errors.site_engineer && (
                <p className="text-sm text-status-overdue">{errors.site_engineer.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="log_date">Log Date</Label>
              <Input id="log_date" type="date" {...register('log_date')} />
              {errors.log_date && <p className="text-sm text-status-overdue">{errors.log_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="crew_size">Crew Size</Label>
              <Input id="crew_size" type="number" min={1} {...register('crew_size', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="crew_experience_years">Crew Experience (Years)</Label>
              <Input
                id="crew_experience_years"
                type="number"
                step="0.5"
                min={0}
                {...register('crew_experience_years', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours_worked">Hours Worked</Label>
              <Input
                id="hours_worked"
                type="number"
                step="0.5"
                min={0}
                max={24}
                {...register('hours_worked', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_completed">Quantity Completed</Label>
              <Input
                id="quantity_completed"
                type="number"
                step="0.01"
                min={0}
                {...register('quantity_completed', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="execution_quality_score">Quality Score (1-3)</Label>
              <Input
                id="execution_quality_score"
                type="number"
                min={1}
                max={3}
                {...register('execution_quality_score', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="weather_condition">Weather Condition</Label>
              <select
                id="weather_condition"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('weather_condition')}
              >
                {weatherOptions.map((weather) => (
                  <option key={weather} value={weather}>
                    {weather}
                  </option>
                ))}
              </select>
            </div>

            {errorMessage && (
              <div className="lg:col-span-2 rounded-md border border-status-overdue/30 bg-status-overdue/10 p-3 text-sm text-status-overdue">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                <Plus size={16} className="mr-1.5" />
                {isSubmitting ? 'Saving...' : 'Save daily log'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent daily logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={16} className="animate-spin" /> Loading logs...
            </div>
          ) : logs?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Task</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Crew Size</th>
                    <th className="py-3 pr-4">Hours</th>
                    <th className="py-3 pr-4">Weather</th>
                    <th className="py-3 pr-4">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">{log.task}</td>
                      <td className="py-3 pr-4 text-gray-700">{log.log_date}</td>
                      <td className="py-3 pr-4 text-gray-700">{log.crew_size ?? '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{log.hours_worked ?? '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{log.weather_condition ?? '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{log.execution_quality_score ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">
              No daily logs yet. Create one to start feeding the AI prediction model.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}