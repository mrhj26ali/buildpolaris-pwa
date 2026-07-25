import { useFieldArray, useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBudgetRecords, useCreateBudget, useProjectsList } from './hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { ApiError } from '@/lib/apiClient'

const LEAF_ACCOUNTS = [
  "6041 - Matières consommables",
  "6223 - Locations de matériels et outillages",
  "6611 - Appointements salaires et commissions"
]

const budgetSchema = z.object({
  company: z.string().default("contech"),
  budget_against: z.string().default("Project"),
  action_if_annual_budget_exceeded: z.string().default("Warn"),
  project: z.string().min(1, 'Project is required'),
  fiscal_year: z.string().min(1, 'Fiscal year is required'),
  accounts: z.array(z.object({
    account: z.string().min(1, 'Account is required'),
    budget_amount: z.coerce.number().min(0.01, 'Amount must be > 0'),
  })).min(1, 'At least one budget account row is required'),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

export function BudgetSetupPage() {
  const { data: budgetRecords, isLoading: isBudgetLoading } = useBudgetRecords()
  const { data: projects, isLoading: isProjectsLoading } = useProjectsList()
  const createBudget = useCreateBudget()

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema) as Resolver<BudgetFormValues>,
    defaultValues: {
      company: "contech",
      budget_against: "Project",
      action_if_annual_budget_exceeded: "Warn",
      project: '',
      fiscal_year: new Date().getFullYear().toString(),
      accounts: [{ account: LEAF_ACCOUNTS[0], budget_amount: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "accounts" })

  const onSubmit: SubmitHandler<BudgetFormValues> = async (values) => {
    try {
      await createBudget.mutateAsync(values)
      reset()
    } catch (err) {
      const message = err instanceof ApiError ? err.serverMessage ?? err.message : 'Could not save budget.'
      alert(message)
    }
  }

  const budgetSummary = budgetRecords?.reduce((acc, record) => 
    acc + (record.accounts?.reduce((sum, row) => sum + row.budget_amount, 0) ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">Budget setup</h1>
        <p className="text-sm text-gray-500">Define budget allocations by project and leaf-level accounts.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">New budget allocation</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-2">
            <input type="hidden" {...register('company')} />
            <input type="hidden" {...register('budget_against')} />
            <input type="hidden" {...register('action_if_annual_budget_exceeded')} />
            
            <div className="space-y-2">
              <Label>Project</Label>
              <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" {...register('project')}>
                <option value="">{isProjectsLoading ? 'Loading...' : 'Select project'}</option>
                {projects?.map((p) => <option key={p.name} value={p.name}>{p.project_name}</option>)}
              </select>
              {errors.project && <p className="text-sm text-status-overdue">{errors.project.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Fiscal Year</Label>
              <Input {...register('fiscal_year')} placeholder="e.g. 2026" />
              {errors.fiscal_year && <p className="text-sm text-status-overdue">{errors.fiscal_year.message}</p>}
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <Label>Budget Accounts (Child Table)</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ account: LEAF_ACCOUNTS[0], budget_amount: 0 })}>
                  <Plus size={14} className="mr-1" /> Add Row
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3">
                  <select className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm" {...register(`accounts.${index}.account`)}>
                    {LEAF_ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                  </select>
                  <Input type="number" step="0.01" placeholder="Amount" className="w-32" {...register(`accounts.${index}.budget_amount`, { valueAsNumber: true })} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1}>
                    <Trash2 size={16} className="text-status-overdue" />
                  </Button>
                </div>
              ))}
              {errors.accounts?.root && <p className="text-sm text-status-overdue">{errors.accounts.root.message}</p>}
            </div>

            <div className="flex items-center gap-3 lg:col-span-2">
              <Button type="submit" disabled={isSubmitting || createBudget.status === 'pending'}>
                {createBudget.status === 'pending' ? 'Saving...' : 'Save budget'}
              </Button>
              <span className="text-sm text-gray-500">Total budgeted across all: ${budgetSummary.toFixed(2)}</span>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Existing budget allocations</CardTitle></CardHeader>
        <CardContent>
          {isBudgetLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : budgetRecords?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border text-left text-gray-500">
                    <th className="py-3 pr-4">Project</th>
                    <th className="py-3 pr-4">Fiscal Year</th>
                    <th className="py-3 pr-4">Accounts & Amounts</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetRecords.map((b) => (
                    <tr key={b.name} className="border-b border-surface-border last:border-0">
                      <td className="py-3 pr-4 text-brand-900">{b.project || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">{b.fiscal_year || '—'}</td>
                      <td className="py-3 pr-4 text-gray-700">
                        {b.accounts?.map((acc, i) => (
                          <div key={i} className="text-xs">{acc.account}: ${acc.budget_amount.toFixed(2)}</div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-6 text-sm text-gray-600">No budgets yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}