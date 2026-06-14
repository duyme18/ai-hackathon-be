import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { AppLayout } from '@/components/app/AppLayout'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) =>
    createElement('a', { href: to }, children),
}))

describe('AppLayout', () => {
  it('renders children', () => {
    render(<AppLayout>{createElement('div', null, 'Page Content')}</AppLayout>)
    expect(screen.getByText('Page Content')).toBeInTheDocument()
  })

  it('renders sidebar and header', () => {
    render(<AppLayout>{createElement('span', null, 'child')}</AppLayout>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(document.querySelector('header')).toBeTruthy()
  })

  it('renders main element', () => {
    render(<AppLayout>{createElement('span', null, 'content')}</AppLayout>)
    expect(document.querySelector('main')).toBeTruthy()
  })
})
