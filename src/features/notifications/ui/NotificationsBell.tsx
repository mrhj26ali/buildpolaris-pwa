import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getUnreadCount } from '../model/useNotifications'
import { cn } from '@/lib/utils'

// Native replacement for date-fns formatDistanceToNow
function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export function NotificationsBell() {
  const { data: notifications, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()
  const unreadCount = getUnreadCount(notifications)
  
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative min-h-11 min-w-11"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notifications</span>
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1" 
                onClick={() => void markAllRead.mutateAsync()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            <div className="flex flex-col">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : !notifications || notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.name}
                    className={cn(
                      "flex flex-col gap-1 border-b px-4 py-3 text-left hover:bg-muted/50 transition-colors w-full",
                      !notif.read && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (!notif.read) void markRead.mutateAsync(notif.name)
                      if (notif.link) window.location.href = notif.link
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className={cn("text-sm leading-snug", !notif.read && "font-medium")}>
                        {notif.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6">
                      <span>{notif.from_user || 'System'}</span>
                      <span>•</span>
                      <span>{timeAgo(notif.creation)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}