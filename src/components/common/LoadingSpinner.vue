<template>
  <div :class="spinnerClasses" :style="{ width: size, height: size }"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: string
  color?: 'primary' | 'white' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  size: '1.5rem',
  color: 'primary',
})

const spinnerClasses = computed(() => {
  const colorClasses = {
    primary: 'border-gray-300 border-t-primary-600',
    white: 'border-gray-400 border-t-white',
    gray: 'border-gray-300 border-t-gray-600',
  }
  
  return [
    'loading-spinner',
    colorClasses[props.color],
  ].join(' ')
})
</script>
