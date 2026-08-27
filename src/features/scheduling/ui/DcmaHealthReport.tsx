import { useDcmaHealthCheck } from '../model/useScheduling'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState } from '@/lib/ui/States'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DcmaHealthReport({ project }: { project: string }) {
    const { data: health, isLoading, isError, error, refetch } = useDcmaHealthCheck(project)
    if (isLoading) return <LoadingState label="Running schedule health check…" />
    if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />
    if (!health) return null

    const summary = health.summary || {}
    const isCompliant = summary.dcma_compliant === true

    const renderFlaggedList = (items: any[], label: string) => {
        if (!items || items.length === 0) return null
        return (
            <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">{label} ({items.length}):</p>
                <ul className="text-xs space-y-1 max-h-32 overflow-y-auto border rounded p-2 bg-muted/30">
                    {items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                            <span className="truncate">{item.task || item.subject || item}</span>
                            {item.reason && <span className="text-muted-foreground ml-2">{item.reason}</span>}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <Card className={cn(!isCompliant && "border-destructive/50")}>
            <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                    <span>Schedule Health</span>
                    <Badge variant={isCompliant ? "default" : "destructive"}>
                        {isCompliant ? "Compliant" : `${summary.total_flagged_items || 0} Issues`}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-medium flex items-center gap-2">
                        {health.logic?.length > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-status-ontrack" />}
                        Logic (Orphans)
                    </p>
                    {renderFlaggedList(health.logic, "Tasks with no dependencies")}
                </div>
                <div>
                    <p className="font-medium flex items-center gap-2">
                        {health.resources?.length > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-status-ontrack" />}
                        Resources (Unassigned)
                    </p>
                    {renderFlaggedList(health.resources, "Tasks without assigned resources")}
                </div>
                <div>
                    <p className="font-medium flex items-center gap-2">
                        {health.missed_tasks_vs_baseline?.length > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-status-ontrack" />}
                        Missed Tasks vs Baseline
                    </p>
                    {renderFlaggedList(health.missed_tasks_vs_baseline, "Tasks past planned finish")}
                </div>
                <div>
                    <p className="font-medium flex items-center gap-2">
                        {health.cpli && !health.cpli.is_healthy ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-status-ontrack" />}
                        Critical Path Length Index (CPLI)
                    </p>
                    {health.cpli ? (
                        <p className={cn("text-sm mt-1", health.cpli.is_healthy ? "text-status-ontrack" : "text-destructive")}>
                            {health.cpli.value} {health.cpli.is_healthy ? "(Healthy ≥ 0.95)" : "(Unhealthy < 0.95)"}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">No baseline captured yet.</p>
                    )}
                </div>
                <div>
                    <p className="font-medium flex items-center gap-2">
                        {health.bei && !health.bei.is_healthy ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-status-ontrack" />}
                        Baseline Execution Index (BEI)
                    </p>
                    {health.bei ? (
                        <p className={cn("text-sm mt-1", health.bei.is_healthy ? "text-status-ontrack" : "text-destructive")}>
                            {health.bei.value} {health.bei.is_healthy ? "(Healthy ≥ 0.95)" : "(Unhealthy < 0.95)"}
                            <span className="text-xs text-muted-foreground ml-2">
                                ({health.bei.completed_to_date}/{health.bei.planned_to_date} tasks)
                            </span>
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1">No baseline captured yet.</p>
                    )}
                </div>
                <div className="md:col-span-2 border-t pt-2 mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Other Checks (Leads, Lags, Float, Constraints, etc.):</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <p>Leads: {health.leads?.length || 0}</p>
                        <p>Lags: {health.lags?.length || 0}</p>
                        <p>High Float: {health.high_float?.length || 0}</p>
                        <p>Negative Float: {health.negative_float?.length || 0}</p>
                        <p>High Duration: {health.high_duration?.length || 0}</p>
                        <p>Hard Constraints: {health.hard_constraints?.length || 0}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}