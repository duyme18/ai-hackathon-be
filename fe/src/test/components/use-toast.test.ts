import { describe, it, expect } from 'vitest'
import { reducer } from '@/components/ui/use-toast'

const initialState = { toasts: [] }

const makeToast = (id: string) => ({
  id,
  title: 'Test',
  open: true,
  onOpenChange: () => {},
})

describe('toast reducer', () => {
  it('adds a toast', () => {
    const toast = makeToast('1')
    const state = reducer(initialState, { type: 'ADD_TOAST', toast })
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0].id).toBe('1')
  })

  it('limits toasts to TOAST_LIMIT (3)', () => {
    let state = initialState
    state = reducer(state, { type: 'ADD_TOAST', toast: makeToast('1') })
    state = reducer(state, { type: 'ADD_TOAST', toast: makeToast('2') })
    state = reducer(state, { type: 'ADD_TOAST', toast: makeToast('3') })
    state = reducer(state, { type: 'ADD_TOAST', toast: makeToast('4') })
    expect(state.toasts).toHaveLength(3)
    expect(state.toasts[0].id).toBe('4')
  })

  it('updates a toast by id', () => {
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: makeToast('1') })
    state = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'Updated' } })
    expect(state.toasts[0].title).toBe('Updated')
  })

  it('dismisses a specific toast by id', () => {
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: makeToast('1') })
    state = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' })
    expect(state.toasts[0].open).toBe(false)
  })

  it('dismisses all toasts when no id provided', () => {
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: makeToast('1') })
    state = reducer(state, { type: 'ADD_TOAST', toast: makeToast('2') })
    state = reducer(state, { type: 'DISMISS_TOAST' })
    expect(state.toasts.every((t) => t.open === false)).toBe(true)
  })

  it('removes a specific toast', () => {
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: makeToast('1') })
    state = reducer(state, { type: 'ADD_TOAST', toast: makeToast('2') })
    state = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' })
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0].id).toBe('2')
  })

  it('removes all toasts when no id provided', () => {
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: makeToast('1') })
    state = reducer(state, { type: 'ADD_TOAST', toast: makeToast('2') })
    state = reducer(state, { type: 'REMOVE_TOAST' })
    expect(state.toasts).toHaveLength(0)
  })

  it('does not mutate existing state', () => {
    const before = { toasts: [makeToast('1')] }
    const after = reducer(before, { type: 'ADD_TOAST', toast: makeToast('2') })
    expect(before.toasts).toHaveLength(1)
    expect(after.toasts).toHaveLength(2)
  })
})
