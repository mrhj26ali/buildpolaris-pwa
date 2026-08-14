import { cn } from '@/lib/utils'
import type { Drawing } from '@/types/domain'
import { EmptyState } from '@/lib/ui/States'

export function DrawingList({
  drawings,
  selected,
  onSelect,
}: {
  drawings: Drawing[]
  selected: Drawing | null
  onSelect: (drawing: Drawing) => void
}) {
  if (drawings.length === 0) {
    return <EmptyState title="No drawings uploaded yet" />
  }

  return (
    <ul className="flex flex-col gap-1" role="listbox" aria-label="Drawings">
      {drawings.map((drawing) => (
        <li key={drawing.name}>
          <button
            type="button"
            role="option"
            aria-selected={selected?.name === drawing.name}
            onClick={() => onSelect(drawing)}
            className={cn(
              'flex min-h-11 w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm',
              selected?.name === drawing.name ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
            )}
          >
            <span className="font-medium">{drawing.drawing_number}</span>
            <span className="text-xs text-muted-foreground">{drawing.title}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
