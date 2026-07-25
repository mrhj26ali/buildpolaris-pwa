import { useFieldArray, useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProcurement, useCreateMaterialRequest } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'

const materialRequestSchema = z.object({
  company: z.string().default("contech"),
  project: z.string().min(1, 'Project is required'),
  material_request_type: z.string().min(1, 'Request type is required'),
  transaction_date: z.string().min(1, 'Transaction date is required'),
  schedule_date: z.string().min(1, 'Schedule date is required'),
  items: z.array(z.object({
    item_code: z.string().min(1, 'Item code is required'),
    qty: z.coerce.number().min(1, 'Quantity must be at least 1'),
    schedule_date: z.string().min(1, 'Schedule date is required'),
    description: z.string().optional(),
  })).min(1, 'At least one item is required'),
})

type MaterialRequestFormValues = z.infer<typeof materialRequestSchema>

interface ProcurementPageProps {
  projectName: string
}

export function ProcurementPage({ projectName }: ProcurementPageProps) {
  const { data: procurement, isLoading, error } = useProcurement(projectName)
  const createRequest = useCreateMaterialRequest()

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<MaterialRequestFormValues>({
    resolver: zodResolver(materialRequestSchema) as Resolver<MaterialRequestFormValues>,
    defaultValues: {
      company: "contech",
      project: projectName,
      material_request_type: 'Purchase',
      transaction_date: new Date().toISOString().slice(0, 10),
      schedule_date: new Date().toISOString().slice(0, 10),
      items: [{ item_code: '', qty: 1, schedule_date: new Date().toISOString().slice(0, 10), description: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "items" })

  const onSubmit: SubmitHandler<MaterialRequestFormValues> = async (values) => {
    try {
      await createRequest.mutateAsync(values)
      reset({
        company: "contech",
        project: projectName,
        material_request_type: 'Purchase',
        transaction_date: new Date().toISOString().slice(0, 10),
        schedule_date: new Date().toISOString().slice(0, 10),
        items: [{ item_code: '', qty: 1, schedule_date: new Date().toISOString().slice(0, 10), description: '' }],
      })
    } catch (err) {
      const message = err instanceof ApiError ? err.serverMessage ?? err.message : 'Could not create material request.'
      alert(message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">Procurement</h1>
        <p className="text-sm text-gray-500">Create material requests and review procurement records for this project.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">New material request</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" {...register('company')} />
            <input type="hidden" {...register('project')} />
            
            <div className="space-y-2">
              <Label>Request type</Label>
              <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" {...register('material_request_type')}>
                <option value="Purchase">Purchase</option>
                <option value="Material Transfer">Material Transfer</option>
                <option value="Material Issue">Material Issue</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Transaction date</Label>
              <Input type="date" {...register('transaction_date')} />
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Items (Child Table)</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ item_code: '', qty: 1, schedule_date: new Date().toISOString().slice(0, 10), description: '' })}>
                  <Plus size={14} className="mr-1" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Item Code</Label>
                    <Input {...register(`items.${index}.item_code`)} placeholder="e.g., Tiles-01" />
                    {errors.items?.[index]?.item_code && <p className="text-xs text-status-overdue">{errors.items[index]?.item_code?.message}</p>}
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min={1} {...register(`items.${index}.qty`, { valueAsNumber: true })} />
                  </div>
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Schedule Date</Label>
                    <Input type="date" {...register(`items.${index}.schedule_date`)} />
                  </div>
                  <div className="col-span-2 flex justify-end pb-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                      <Trash2 size={16} className="text-status-overdue" />
                    </Button>
                  </div>
                  <div className="col-span-12 space-y-1">
                    <Input {...register(`items.${index}.description`)} placeholder="Description (optional)" />
                  </div>
                </div>
              ))}
              {errors.items?.root && <p className="text-sm text-status-overdue">{errors.items.root.message}</p>}
            </div>

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting || createRequest.status === 'pending'}>
                {createRequest.status === 'pending' ? 'Creating...' : 'Create request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Procurement records</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> Loading procurement...</div>
          ) : error ? (
            <div className="rounded-md border border-status-overdue/30 bg-status-overdue/10 p-4 text-sm text-status-overdue">Could not load procurement records.</div>
          ) : procurement?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {procurement.map((record) => (
                    <tr key={record.name} className="border-b border-surface-border last:border-0 hover:bg-surface-card">
                      <td className="py-3 pr-4 text-brand-900">{record.material_request_type || 'Material Request'}</td>
                      <td className="py-3 pr-4 text-gray-700">{record.transaction_date || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{record.status || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">No procurement records found for this project.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}