import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-surface-base">
      <h1 className="text-2xl font-semibold text-brand-900">{t('notFound.title')}</h1>
      <p className="text-sm text-gray-500">{t('notFound.body')}</p>
    </div>
  )
}
