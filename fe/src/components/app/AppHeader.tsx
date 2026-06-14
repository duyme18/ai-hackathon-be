import { User } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="flex h-[60px] shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-foreground">
          tendoo<span className="text-primary">°</span> AI
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-medium">Admin</span>
      </div>
    </header>
  )
}
