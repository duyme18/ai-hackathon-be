import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HomePage } from '@/pages/HomePage'

describe('HomePage', () => {
  it('renders dashboard heading', () => {
    render(<HomePage />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<HomePage />)
    expect(screen.getByText(/Chào mừng/)).toBeInTheDocument()
  })
})
