import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppHeader } from '@/components/app/AppHeader'

describe('AppHeader', () => {
  it('renders without crashing', () => {
    render(<AppHeader />)
  })

  it('displays brand name', () => {
    render(<AppHeader />)
    expect(screen.getByText(/tendoo/i)).toBeInTheDocument()
  })

  it('displays Admin label', () => {
    render(<AppHeader />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renders a header element', () => {
    const { container } = render(<AppHeader />)
    expect(container.querySelector('header')).toBeTruthy()
  })
})
