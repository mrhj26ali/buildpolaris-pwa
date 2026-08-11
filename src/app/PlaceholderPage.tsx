import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brand-900">{title}</h1>
        <p className="text-sm text-gray-500">This module is prepared for the implementation phase.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            The architectural plumbing for this feature is complete. 
            Data fetching, offline-sync, and UI components will be wired up in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



