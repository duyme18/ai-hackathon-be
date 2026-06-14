import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: Readonly<AppLayoutProps>) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  )
}
