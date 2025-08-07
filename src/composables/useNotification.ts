import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const notifications = ref<Notification[]>([])

export function useNotification() {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    }
    
    notifications.value.push(newNotification)
    
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const showSuccess = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'success', title, message, duration })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'error', title, message, duration })
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'warning', title, message, duration })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    return addNotification({ type: 'info', title, message, duration })
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  }
}