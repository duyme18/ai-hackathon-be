import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createElement } from 'react'
import { Sidebar } from '@/components/app/Sidebar'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string; activeProps?: object }) =>
    createElement('a', { href: to, className }, children),
}))

describe('Sidebar', () => {
  it('renders without crashing', () => {
    render(<Sidebar />)
  })

  it('renders all top-level nav items', () => {
    render(<Sidebar />)
    expect(screen.getByText('Prompt Builder')).toBeInTheDocument()
    expect(screen.getByText('Flow Builder')).toBeInTheDocument()
    expect(screen.getByText('Quản lý câu lệnh')).toBeInTheDocument()
    expect(screen.getByText('Quản lý danh mục')).toBeInTheDocument()
    expect(screen.getByText('Lịch sử hệ thống')).toBeInTheDocument()
  })

  it('renders expandable groups with children open by default', () => {
    render(<Sidebar />)
    expect(screen.getByText('Danh mục tham số')).toBeInTheDocument()
    expect(screen.getByText('Cấu hình hệ thống')).toBeInTheDocument()
  })

  it('collapses group when header button is clicked', () => {
    render(<Sidebar />)
    const groupButton = screen.getByText('Quản lý danh mục').closest('button')!
    fireEvent.click(groupButton)
    expect(screen.queryByText('Cấu hình hệ thống')).not.toBeInTheDocument()
  })

  it('expands group again when clicked twice', () => {
    render(<Sidebar />)
    const groupButton = screen.getByText('Quản lý danh mục').closest('button')!
    fireEvent.click(groupButton)
    fireEvent.click(groupButton)
    expect(screen.getByText('Cấu hình hệ thống')).toBeInTheDocument()
  })

  it('renders nav links with correct hrefs', () => {
    render(<Sidebar />)
    const promptLink = screen.getByText('Prompt Builder').closest('a')
    expect(promptLink?.getAttribute('href')).toBe('/prompt-builder')
  })

  it('renders Lịch sử hệ thống children', () => {
    render(<Sidebar />)
    expect(screen.getByText('Quản lý log message')).toBeInTheDocument()
    expect(screen.getByText('Quản lý log hệ thống')).toBeInTheDocument()
  })
})
