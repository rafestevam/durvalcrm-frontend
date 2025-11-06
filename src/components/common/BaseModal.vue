<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
          <!-- Overlay -->
          <div 
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="onOverlayClick"
          ></div>
          
          <!-- Modal -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="transform opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="transform opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div 
              v-if="show"
              class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
              :class="sizeClasses"
            >
              <!-- Header -->
              <div v-if="$slots.header || title" class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <slot name="header">
                      <h3 class="text-lg font-medium leading-6 text-gray-900">
                        {{ title }}
                      </h3>
                    </slot>
                  </div>
                  
                  <button
                    v-if="showCloseButton"
                    type="button"
                    class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    data-testid="modal-close-button"
                    @click="close"
                  >
                    <span class="sr-only">Fechar</span>
                    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
              
              <!-- Body -->
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
                <slot />
              </div>
              
              <!-- Footer -->
              <div v-if="$slots.footer" class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlay: true,
  showCloseButton: true,
})

const emit = defineEmits<{
  close: []
  'update:show': [value: boolean]
}>()

const sizeClasses = computed(() => {
  const classes = {
    sm: 'sm:max-w-sm sm:w-full',
    md: 'sm:max-w-lg sm:w-full',
    lg: 'sm:max-w-2xl sm:w-full',
    xl: 'sm:max-w-4xl sm:w-full',
  }
  
  return classes[props.size]
})

function close() {
  emit('close')
  emit('update:show', false)
}

function onOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}

// Previne scroll do body quando modal está aberto
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
