import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Square } from 'lucide-react'

export function ChatInput({
  onSend,
  onStop,
  streaming,
}: {
  onSend: (text: string) => void
  onStop: () => void
  streaming: boolean
}) {
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() || streaming) return
    onSend(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t p-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask about this project, find something, or request a draft…"
        rows={1}
        className="min-h-11 flex-1 resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
          }
        }}
      />
      {streaming ? (
        <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11" onClick={onStop}>
          <Square className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : (
        <Button type="submit" size="icon" className="min-h-11 min-w-11" disabled={!text.trim()}>
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </form>
  )
}
