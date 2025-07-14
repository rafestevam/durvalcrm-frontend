<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div v-if="show" :class="alertClasses">
      <div class="flex">
        <div class="flex-shrink-0">
          <component :is="iconComponent" class="h-5 w-5" aria-hidden="true" />
        </div>
        
        <div class="ml-3 flex-1">
          <h3 v-if="title" class="text-sm font-medium">
            {{ title }}
          </h3>
          
          <div class="text-sm" :class="{ 'mt-1': title }">
            <slot>{{ message }}</slot>
          </div>
        </div>
        
        <div v-if="dismissible" class="ml-auto pl-3">
          <button
            type="button"
            class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="dismissButtonClasses"
            @click="dismiss"
          >
            <span class="sr-only">Fechar</span>
            <XMarkIcon class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  type?: 'success' | 'warning' | 'info' | 'error'
  title?: string
  message?: string
  dismissible?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: true,
  autoHide: false,
  autoHideDelay: 5000,
})

const emit = defineEmits<{
  dismiss: []
}>()

const show = ref(true)

const alertClasses = computed(() => {
  const baseClasses = 'rounded-md p-4'
  const typeClasses = {
    success: 'bg-success-50 text-success-800',
    warning: 'bg-warning-50 text-warning-800',
    info: 'bg-blue-50 text-blue-800',
    error: 'bg-danger-50 text-danger-800',
  }
  
  return `${baseClasses} ${typeClasses[props.type]}`
})

const iconComponent = computed(() => {
  const icons = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
    error: XCircleIcon,
  }
  
  return icons[props.type]
})

const dismissButtonClasses = computed(() => {
  const classes = {
    success: 'text-success-500 hover:bg-success-100 focus:ring-success-600',
    warning: 'text-warning-500 hover:bg-warning-100 focus:ring-warning-600',
    info: 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
    error: 'text-danger-500 hover:bg-danger-100 focus:ring-danger-600',
  }
  
  return classes[props.type]
})

function dismiss() {
  show.value = false
  emit('dismiss')
}

onMounted(() => {
  if (props.autoHide) {
    setTimeout(() => {
      dismiss()
    }, props.autoHideDelay)
  }
})
</script>
