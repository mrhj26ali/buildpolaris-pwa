import { AlertCircle } from 'lucide-react'

// NFR-SCALE.5: "the platform must work even if it's [the AI sidecar] down."
// This banner is scoped to the copilot panel only — it never blocks or warns
// on any other screen, because no other screen depends on buildpolaris_ai.
export function CopilotUnavailableBanner() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
    >
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      The copilot is temporarily unavailable. The rest of BuildPolaris is unaffected — try again in a moment.
    </div>
  )
}
