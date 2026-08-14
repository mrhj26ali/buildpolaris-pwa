import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProject } from './ProjectContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bffRequest } from '@/lib/clients/bffClient'
import { FolderKanban, Calendar, DollarSign, Users } from 'lucide-react'

interface ProjectNode {
  name: string
  project_name: string
  status: string
  percent_complete: number
  expected_start_date: string | null
  expected_end_date: string | null
  estimated_cost: number
}

export function ProjectsListPage() {
  const { t } = useTranslation()
  const { projects, setProjectId } = useProject()
  const [projectDetails, setProjectDetails] = useState<Record<string, ProjectNode>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (projects.length === 0) {
      setIsLoading(false)
      return
    }

    const loadDetails = async () => {
      const details: Record<string, ProjectNode> = {}
      
      for (const proj of projects) {
        try {
          const data = await bffRequest<ProjectNode>(
            '/method/buildpolaris_bff.api.projects.get_project_details',
            { method: 'POST', body: JSON.stringify({ project: proj.name }) }
          )
          details[proj.name] = data
        } catch {
          // Skip failed loads
        }
      }
      
      setProjectDetails(details)
      setIsLoading(false)
    }

    loadDetails()
  }, [projects])

  if (projects.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              {t('project.noProjects')}
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
          {t('shell.nav.projects')}
        </h1>
        <p className="text-sm text-gray-500">
          {projects.length} project{projects.length !== 1 ? 's' : ''} assigned
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((proj) => {
          const details = projectDetails[proj.name]
          return (
            <Card key={proj.name} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-brand-500" />
                  {proj.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{details.percent_complete}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all"
                          style={{ width: `${details.percent_complete}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {details.expected_start_date && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>Start: {new Date(details.expected_start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {details.expected_end_date && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>End: {new Date(details.expected_end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {details.estimated_cost > 0 && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <DollarSign className="h-3 w-3" />
                          <span>Budget: {formatCurrency(details.estimated_cost)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button
                  className="w-full bg-brand-500"
                  onClick={() => setProjectId(proj.name)}
                >
                  Select Project
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}
