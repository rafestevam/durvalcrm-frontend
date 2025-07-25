import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import LoadingSpinner from '../LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(LoadingSpinner)
    
    const spinner = container.querySelector('.loading-spinner')
    expect(spinner).toBeTruthy()
    expect(spinner).toHaveClass('border-gray-300', 'border-t-primary-600')
    expect(spinner).toHaveStyle({ width: '24px', height: '24px' })
  })

  it('renders with custom size', () => {
    const { container } = render(LoadingSpinner, {
      props: { size: '2rem' }
    })
    
    const spinner = container.querySelector('.loading-spinner')
    expect(spinner).toHaveStyle({ width: '32px', height: '32px' })
  })

  it('renders with different colors', async () => {
    const { container, rerender } = render(LoadingSpinner, {
      props: { color: 'white' }
    })
    
    let spinner = container.querySelector('.loading-spinner')
    expect(spinner).toHaveClass('border-gray-400', 'border-t-white')

    await rerender({ color: 'gray' })
    spinner = container.querySelector('.loading-spinner') // Re-query after rerender
    expect(spinner).toHaveClass('border-gray-300', 'border-t-gray-600')
  })

  it('applies custom size as CSS property', () => {
    const { container } = render(LoadingSpinner, {
      props: { size: '3rem' }
    })
    
    const spinner = container.querySelector('.loading-spinner')
    expect(spinner).toHaveStyle({ width: '48px', height: '48px' })
  })
})