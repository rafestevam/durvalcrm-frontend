<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <component :is="icon" class="h-6 w-6" :class="iconColor" />
        </div>
        <div class="ml-5 w-0 flex-1">
          <dl>
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ titulo }}
            </dt>
            <dd class="text-lg font-medium text-gray-900">
              {{ valor }}
            </dd>
          </dl>
        </div>
      </div>
    </div>
    <div v-if="porcentagem !== undefined" class="bg-gray-50 px-5 py-3">
      <div class="text-sm">
        <span class="font-medium" :class="porcentagemColor">
          {{ porcentagem }}%
        </span>
        <span class="text-gray-600 ml-2">do total</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  titulo: string
  valor: string | number
  icon: any
  iconColor?: string
  porcentagem?: number
  porcentagemColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'text-gray-400',
  porcentagemColor: 'text-gray-900'
})
</script>