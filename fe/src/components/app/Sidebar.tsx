import { Link } from '@tanstack/react-router'
import { Settings2, LayoutDashboard, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface NavItem {
  label: string
  path?: string
  icon?: React.ReactNode
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: 'Quản lý danh mục',
    icon: <Settings2 className="h-4 w-4" />,
    children: [
      { label: 'Danh mục tham số', path: '/system-parameters' },
    ],
  },
]

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const [open, setOpen] = useState(true)

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
            depth > 0 && 'pl-6'
          )}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="ml-2">
            {item.children.map((child) => (
              <NavLink key={child.label} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      to={item.path!}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
        depth > 0 && 'pl-8'
      )}
      activeProps={{ className: 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' }}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-14 items-center px-4 border-b border-sidebar-border">
        <span className="font-bold text-sidebar-foreground text-lg">Tendoo AI</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navigation.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  )
}
