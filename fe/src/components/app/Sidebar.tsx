import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  GitBranch,
  Terminal,
  LayoutGrid,
  History,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
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
    label: 'Prompt Builder',
    path: '/prompt-builder',
    icon: <BookOpen className="h-4 w-4 shrink-0" />,
  },
  {
    label: 'Flow Builder',
    path: '/flow-builder',
    icon: <GitBranch className="h-4 w-4 shrink-0" />,
  },
  {
    label: 'Quản lý câu lệnh',
    path: '/commands',
    icon: <Terminal className="h-4 w-4 shrink-0" />,
  },
  {
    label: 'Quản lý danh mục',
    icon: <LayoutGrid className="h-4 w-4 shrink-0" />,
    children: [
      { label: 'Danh mục tham số', path: '/categories' },
      { label: 'Cấu hình hệ thống', path: '/system-parameters' },
    ],
  },
  {
    label: 'Lịch sử hệ thống',
    icon: <History className="h-4 w-4 shrink-0" />,
    children: [
      { label: 'Quản lý log message', path: '/logs/messages' },
      { label: 'Quản lý log hệ thống', path: '/logs/system' },
    ],
  },
]

function NavLeaf({ item, depth = 0 }: Readonly<{ item: NavItem; depth?: number }>) {
  if (!item.path) return null
  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors',
        'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        depth === 0 ? 'px-3' : 'pl-9 pr-3'
      )}
      activeProps={{
        className: 'bg-sidebar-primary text-sidebar-primary-foreground font-medium',
      }}
    >
      {depth === 0 && item.icon}
      {depth > 0 && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70 shrink-0" />
      )}
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

function NavGroup({ item }: Readonly<{ item: NavItem }>) {
  const [open, setOpen] = useState(true)

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
      >
        {item.icon}
        <span className="flex-1 text-left truncate">{item.label}</span>
        {open
          ? <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
          : <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
        }
      </button>
      {open && item.children && (
        <div className="mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <NavLeaf key={child.path} item={child} depth={1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {navigation.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} />
          ) : (
            <NavLeaf key={item.label} item={item} />
          )
        )}
      </nav>
    </aside>
  )
}
