import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('renders correctly with default props', () => {
    render(BaseButton, {
      slots: {
        default: 'Click me'
      }
    })
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('btn', 'btn-primary', 'px-4', 'py-2', 'text-sm')
  })

  it('renders with different variants', async () => {
    const { rerender } = render(BaseButton, {
      props: { variant: 'secondary' },
      slots: { default: 'Secondary Button' }
    })
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('btn-secondary')

    await rerender({ variant: 'danger' })
    button = screen.getByRole('button') // Re-query after rerender
    expect(button).toHaveClass('btn-danger')
  })

  it('renders with different sizes', async () => {
    const { rerender } = render(BaseButton, {
      props: { size: 'sm' },
      slots: { default: 'Small Button' }
    })
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')

    await rerender({ size: 'lg' })
    button = screen.getByRole('button') // Re-query after rerender
    expect(button).toHaveClass('px-6', 'py-3', 'text-base')
  })

  it('handles disabled state', () => {
    render(BaseButton, {
      props: { disabled: true },
      slots: { default: 'Disabled Button' }
    })
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('handles loading state', () => {
    render(BaseButton, {
      props: { loading: true },
      slots: { default: 'Loading Button' }
    })
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('applies full width when specified', () => {
    render(BaseButton, {
      props: { fullWidth: true },
      slots: { default: 'Full Width Button' }
    })
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })

  it('emits click event when clicked', async () => {
    const clickHandler = vi.fn()
    render(BaseButton, {
      props: {
        onClick: clickHandler
      },
      slots: { default: 'Clickable Button' }
    })
    
    const button = screen.getByRole('button')
    await fireEvent.click(button)
    
    expect(clickHandler).toHaveBeenCalledOnce()
  })

  it('does not emit click when disabled', async () => {
    const clickHandler = vi.fn()
    render(BaseButton, {
      props: {
        disabled: true,
        onClick: clickHandler
      },
      slots: { default: 'Disabled Button' }
    })
    
    const button = screen.getByRole('button')
    await fireEvent.click(button)
    
    expect(clickHandler).not.toHaveBeenCalled()
  })

  it('does not emit click when loading', async () => {
    const clickHandler = vi.fn()
    render(BaseButton, {
      props: {
        loading: true,
        onClick: clickHandler
      },
      slots: { default: 'Loading Button' }
    })
    
    const button = screen.getByRole('button')
    await fireEvent.click(button)
    
    expect(clickHandler).not.toHaveBeenCalled()
  })

  it('renders different button types', async () => {
    const { rerender } = render(BaseButton, {
      props: { type: 'submit' },
      slots: { default: 'Submit Button' }
    })
    
    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')

    await rerender({ type: 'reset' })
    button = screen.getByRole('button') // Re-query after rerender
    expect(button).toHaveAttribute('type', 'reset')
  })
})