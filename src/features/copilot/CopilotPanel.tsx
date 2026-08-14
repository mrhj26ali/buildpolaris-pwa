import { useState, useRef, useEffect } from 'react'
import { streamAiRequest, type AiStreamEvent } from '@/lib/clients/aiClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Send, Bot, User, AlertCircle } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Array<{ source_id: string; span: string }>
  isStreaming?: boolean
}

export function CopilotPanel() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    const assistantMessageId = (Date.now() + 1).toString()
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true },
    ])

    try {
      await streamAiRequest(
        '/v1/copilot/message',
        { message: userMessage.content, project_context: user?.projects?.[0]?.name },
        {
          onEvent: (event: AiStreamEvent) => {
            if (event.type === 'answer') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + event.text_delta, citations: event.citations }
                    : msg
                )
              )
            }
          },
        }
      )

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex h-[calc(100vh-8rem)] flex-col">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-5 w-5 text-brand-500" />
          BuildPolaris Copilot
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-gray-500">
              <div>
                <Bot className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Ask me anything about your project</p>
                <p className="text-xs mt-1">
                  I can help with RFIs, schedules, budgets, and more
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <Bot className="h-4 w-4 text-brand-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
                )}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs text-gray-600 font-medium mb-1">Sources:</p>
                    {msg.citations.map((cite, idx) => (
                      <div key={idx} className="text-xs text-gray-500">
                        [{idx + 1}] {cite.source_id}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-red-50 text-red-900">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your project..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-brand-500"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
