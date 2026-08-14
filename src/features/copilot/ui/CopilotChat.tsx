import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot } from 'lucide-react';
import { bffRequest } from '@/lib/clients/bffClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function CopilotChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', isStreaming: true }]);

    try {
      // Proxied through BFF. PWA NEVER talks to buildpolaris_ai directly (ARCH §4.2)
      const response = await bffRequest<{ answer: string }>('/method/buildpolaris_bff.api.ai_copilot.copilot_gateway_service.send_message', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg.content }),
      });
      
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: response.answer, isStreaming: false } : m));
    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Error: Copilot unavailable or failed.', isStreaming: false } : m));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex h-[calc(100vh-8rem)] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-brand-500" /> BuildPolaris Copilot
          <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">AI Generated</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.isStreaming && <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about your project..." disabled={isLoading} className="flex-1" />
          <Button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-500"><Send className="h-4 w-4" /></Button>
        </form>
      </CardContent>
    </Card>
  );
}
