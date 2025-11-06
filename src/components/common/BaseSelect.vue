<template>
  <div class="space-y-1">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      :id="inputId"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      :class="{
        'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500': error,
        'bg-gray-50 cursor-not-allowed': disabled
      }"
      :data-testid="dataTestid"
      @change="handleChange"
      @blur="$emit('blur', $event)"
    >
      <slot />
    </select>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  dataTestid?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  required: false,
  disabled: false,
  error: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [event: Event]
  blur: [event: FocusEvent]
}>()

const inputId = computed(() => `select-${Math.random().toString(36).substring(2, 9)}`)

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', event)
}
</script>
