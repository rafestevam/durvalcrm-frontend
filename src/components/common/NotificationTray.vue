<template>
  <div class="absolute top-4 right-4 z-50 space-y-2 max-w-full">
    <TransitionGroup
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'min-w-80 max-w-md w-full shadow-lg rounded-lg pointer-events-auto',
          notificationClasses[notification.type]
        ]"
      >
        <div class="p-5">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Success Icon -->
              <svg v-if="notification.type === 'success'" class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Error Icon -->
              <svg v-else-if="notification.type === 'error'" class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <!-- Warning Icon -->
              <svg v-else-if="notification.type === 'warning'" class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <!-- Info Icon -->
              <svg v-else class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p :class="['text-base font-semibold break-words', textClasses[notification.type]]">
                {{ notification.title }}
              </p>
              <p v-if="notification.message" :class="['mt-1 text-sm break-words', textClasses[notification.type] + ' opacity-90']">
                {{ notification.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="removeNotification(notification.id)"
                :class="[
                  'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
                  buttonClasses[notification.type]
                ]"
              >
                <span class="sr-only">Fechar</span>
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()

// Classes de estilo para cada tipo
const notificationClasses = {
  success: 'bg-green-50 border-2 border-green-300',
  error: 'bg-red-50 border-2 border-red-300',
  warning: 'bg-yellow-50 border-2 border-yellow-300',
  info: 'bg-blue-50 border-2 border-blue-300'
}

const textClasses = {
  success: 'text-green-800',
  error: 'text-red-800', 
  warning: 'text-yellow-800',
  info: 'text-blue-800'
}

const buttonClasses = {
  success: 'text-green-400 hover:text-green-600 focus:ring-green-500',
  error: 'text-red-400 hover:text-red-600 focus:ring-red-500',
  warning: 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500',
  info: 'text-blue-400 hover:text-blue-600 focus:ring-blue-500'
}
</script>

<style scoped>
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>