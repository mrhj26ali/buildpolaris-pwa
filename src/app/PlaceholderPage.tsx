import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PlaceholderPage({ title, body }: { title: string; body?: string }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">{title}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{body ?? t('placeholder.body')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
