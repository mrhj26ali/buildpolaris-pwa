import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/useAuth'
import { GlobalSyncIndicator } from '@/lib/ui/GlobalSyncIndicator'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useProjectContext } from '@/app/providers/ProjectContext'
import { ChevronDown, LogOut, User } from 'lucide-react'
// 1. Import your existing CreateProjectDialog
import { CreateProjectDialog } from '@/features/projects/ui/CreateProjectDialog' 

export function HeaderBar() {
  const { session, logout } = useAuth()
  const { activeProject, setActiveProject } = useProjectContext()
  const navigate = useNavigate()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="min-h-11 gap-2 font-medium">
            {activeProject?.title ?? 'Select project'}
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {session?.projects.map((project) => (
            <DropdownMenuItem key={project.name} onSelect={() => setActiveProject(project)}>
              {project.title}
            </DropdownMenuItem>
          ))}
          
          {/* 2. ADD THIS: Separator and the Create Project Dialog Trigger */}
          {session?.projects && session.projects.length > 0 && <DropdownMenuSeparator />}
          
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <CreateProjectDialog onCreated={() => window.location.reload()} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-4">
        <GlobalSyncIndicator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-full">
              <User className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{session?.full_name}</p>
              <p className="text-xs text-muted-foreground">{session?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                void logout().then(() => navigate('/login'))
              }}
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}