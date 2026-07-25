import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { type SubmitHandler, type Resolver, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateProject, useProjectTemplates } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError } from '@/lib/apiClient'

const projectSchema = z
  .object({
    project_name: z.string().min(1, 'Project name is required'),
    project_template: z.string().optional(),
    status: z.string().min(1, 'Status is required'),
    project_type: z.string().min(1, 'Project type is required'),
    priority: z.string().min(1, 'Priority is required'),
    expected_start_date: z.string().min(1, 'Expected start date is required'),
    expected_end_date: z.string().min(1, 'Expected end date is required'),
    percent_complete: z.coerce.number().min(0, 'Percent complete must be at least 0').max(100, 'Percent complete must be at most 100'),
  })
  .refine(
    (values) => new Date(values.expected_end_date) >= new Date(values.expected_start_date),
    {
      path: ['expected_end_date'],
      message: 'Expected end date must be on or after the start date',
    }
  )

type ProjectFormValues = z.infer<typeof projectSchema>

const statusOptions = ['Open', 'Completed', 'Cancelled']
const projectTypeOptions = ['Internal', 'External', 'Maintenance', 'Renovation', 'Other']
const priorityOptions = ['Low', 'Medium', 'High']

export function NewProjectPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const createProject = useCreateProject()
  const { data: templates, isLoading: isTemplateLoading, error: templateError } = useProjectTemplates()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectFormValues>,
    defaultValues: {
      project_template: '',
      status: 'Open',
      project_type: 'Internal',
      priority: 'Medium',
      percent_complete: 0,
    },
  })

  const onSubmit: SubmitHandler<ProjectFormValues> = async (values) => {
    setServerError(null)
    try {
      await createProject.mutateAsync({
        ...values,
        project_template: values.project_template || undefined,
      })
      navigate('/projects')
    } catch (err) {
      const message =
        err instanceof ApiError && err.serverMessage
          ? err.serverMessage
          : 'Could not create project. Please verify your values and try again.'
      setServerError(message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">Create project</h1>
          <p className="text-sm text-gray-500">Add a new construction project and track its schedule and completion.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/projects">Back to projects</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project_name">Project name</Label>
              <Input id="project_name" {...register('project_name')} />
              {errors.project_name && (
                <p className="text-sm text-status-overdue">{errors.project_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_template">Project template</Label>
              <select
                id="project_template"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('project_template')}
                disabled={isTemplateLoading}
              >
                <option value="">No template</option>
                {templates?.map((template) => (
                  <option key={template.name} value={template.name}>
                    {/* FIX: Changed from template.project_template_name to template.name */}
                    {template.name}
                  </option>
                ))}
              </select>
              {templateError && (
                <p className="text-sm text-status-overdue">Could not load project templates.</p>
              )}
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
              {errors.status && (
                <p className="text-sm text-status-overdue">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_type">Project type</Label>
              <select
                id="project_type"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('project_type')}
              >
                {projectTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.project_type && (
                <p className="text-sm text-status-overdue">{errors.project_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                {...register('priority')}
              >
                {priorityOptions.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {errors.priority && (
                <p className="text-sm text-status-overdue">{errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_start_date">Expected start date</Label>
              <Input id="expected_start_date" type="date" {...register('expected_start_date')} />
              {errors.expected_start_date && (
                <p className="text-sm text-status-overdue">{errors.expected_start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_end_date">Expected end date</Label>
              <Input id="expected_end_date" type="date" {...register('expected_end_date')} />
              {errors.expected_end_date && (
                <p className="text-sm text-status-overdue">{errors.expected_end_date.message}</p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="percent_complete">Percent complete</Label>
              <Input
                id="percent_complete"
                type="number"
                min={0}
                max={100}
                step={1}
                {...register('percent_complete', { valueAsNumber: true })}
              />
              {errors.percent_complete && (
                <p className="text-sm text-status-overdue">{errors.percent_complete.message}</p>
              )}
            </div>

            {serverError && (
              <div className="lg:col-span-2 rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">
                {serverError}
              </div>
            )}

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Create project'}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/projects">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}