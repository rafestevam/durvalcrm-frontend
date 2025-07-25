import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useNotification } from '../useNotification'

describe('useNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Limpar notifications antes de cada teste
    const { clearAll } = useNotification()
    clearAll()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('adds a notification correctly', () => {
    const { addNotification, notifications } = useNotification()
    
    const id = addNotification({
      type: 'success',
      title: 'Test notification',
      message: 'Test message'
    })
    
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0]).toMatchObject({
      id,
      type: 'success',
      title: 'Test notification',
      message: 'Test message',
      duration: 5000
    })
  })

  it('generates unique IDs for notifications', () => {
    const { addNotification, notifications } = useNotification()
    
    const id1 = addNotification({ type: 'info', title: 'First' })
    const id2 = addNotification({ type: 'info', title: 'Second' })
    
    expect(id1).not.toBe(id2)
    expect(notifications.value).toHaveLength(2)
    expect(notifications.value[0].id).toBe(id1)
    expect(notifications.value[1].id).toBe(id2)
  })

  it('removes notification by ID', () => {
    const { addNotification, removeNotification, notifications } = useNotification()
    
    const id1 = addNotification({ type: 'info', title: 'First' })
    const id2 = addNotification({ type: 'info', title: 'Second' })
    
    expect(notifications.value).toHaveLength(2)
    
    removeNotification(id1)
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0].id).toBe(id2)
  })

  it('auto-removes notifications after duration', () => {
    const { addNotification, notifications } = useNotification()
    
    addNotification({
      type: 'info',
      title: 'Auto remove',
      duration: 1000
    })
    
    expect(notifications.value).toHaveLength(1)
    
    vi.advanceTimersByTime(1000)
    
    expect(notifications.value).toHaveLength(0)
  })

  it('does not auto-remove notifications with duration 0', () => {
    const { addNotification, notifications } = useNotification()
    
    addNotification({
      type: 'error',
      title: 'Persistent notification',
      duration: 0
    })
    
    expect(notifications.value).toHaveLength(1)
    
    vi.advanceTimersByTime(10000)
    
    expect(notifications.value).toHaveLength(1)
  })

  it('showSuccess creates success notification', () => {
    const { showSuccess, notifications } = useNotification()
    
    showSuccess('Success title', 'Success message')
    
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0]).toMatchObject({
      type: 'success',
      title: 'Success title',
      message: 'Success message'
    })
  })

  it('showError creates error notification', () => {
    const { showError, notifications } = useNotification()
    
    showError('Error title', 'Error message')
    
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0]).toMatchObject({
      type: 'error',
      title: 'Error title',
      message: 'Error message'
    })
  })

  it('showWarning creates warning notification', () => {
    const { showWarning, notifications } = useNotification()
    
    showWarning('Warning title')
    
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0]).toMatchObject({
      type: 'warning',
      title: 'Warning title'
    })
  })

  it('showInfo creates info notification', () => {
    const { showInfo, notifications } = useNotification()
    
    showInfo('Info title', 'Info message', 2000)
    
    expect(notifications.value).toHaveLength(1)
    expect(notifications.value[0]).toMatchObject({
      type: 'info',
      title: 'Info title',
      message: 'Info message',
      duration: 2000
    })
  })

  it('clearAll removes all notifications', () => {
    const { addNotification, clearAll, notifications } = useNotification()
    
    addNotification({ type: 'info', title: 'First' })
    addNotification({ type: 'success', title: 'Second' })
    addNotification({ type: 'error', title: 'Third' })
    
    expect(notifications.value).toHaveLength(3)
    
    clearAll()
    
    expect(notifications.value).toHaveLength(0)
  })

  it('handles default duration when not specified', () => {
    const { addNotification, notifications } = useNotification()
    
    addNotification({
      type: 'info',
      title: 'Default duration'
    })
    
    expect(notifications.value[0].duration).toBe(5000)
  })

  it('handles custom duration', () => {
    const { showSuccess, notifications } = useNotification()
    
    showSuccess('Custom duration', undefined, 3000)
    
    expect(notifications.value[0].duration).toBe(3000)
  })

  it('removes notification that does not exist gracefully', () => {
    const { removeNotification, notifications } = useNotification()
    
    expect(() => removeNotification('non-existent-id')).not.toThrow()
    expect(notifications.value).toHaveLength(0)
  })
})