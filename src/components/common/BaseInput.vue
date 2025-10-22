<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :class="inputClasses"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />
      
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>
    
    <p v-if="error" class="form-error">
      {{ error }}
    </p>
    
    <p v-else-if="hint" class="text-sm text-gray-500 mt-1">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string
  type?: string
  label?: string
  name?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  validator?: (value: string) => string | null
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  return [
    'form-input',
    props.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500' : '',
    props.disabled ? 'bg-gray-100 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ')
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onBlur(event: FocusEvent) {
  emit('blur', event)
}

function onFocus(event: FocusEvent) {
  emit('focus', event)
}
</script>
