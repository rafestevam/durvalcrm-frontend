<template>
  <div class="flex items-center space-x-4">
    <button
      @click="$emit('periodoAnterior')"
      class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
      data-testid="seletor-periodo-anterior-button"
    >
      <ChevronLeftIcon class="h-5 w-5" />
    </button>

    <div class="flex items-center space-x-2">
      <select
        :value="mes"
        @change="onMesChange"
        class="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
        data-testid="seletor-periodo-mes-select"
      >
        <option v-for="(nome, index) in meses" :key="index" :value="index + 1">
          {{ nome }}
        </option>
      </select>

      <select
        :value="ano"
        @change="onAnoChange"
        class="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
        data-testid="seletor-periodo-ano-select"
      >
        <option v-for="anoOpcao in anosDisponiveis" :key="anoOpcao" :value="anoOpcao">
          {{ anoOpcao }}
        </option>
      </select>
    </div>

    <button
      @click="$emit('proximoPeriodo')"
      class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
      data-testid="seletor-periodo-proximo-button"
    >
      <ChevronRightIcon class="h-5 w-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  mes: number
  ano: number
}

interface Emits {
  (e: 'alterarPeriodo', mes: number, ano: number): void
  (e: 'periodoAnterior'): void
  (e: 'proximoPeriodo'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const anosDisponiveis = computed(() => {
  const anoAtual = new Date().getFullYear()
  const anos = []
  for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
    anos.push(i)
  }
  return anos
})

function onMesChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('alterarPeriodo', parseInt(target.value), props.ano)
}

function onAnoChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('alterarPeriodo', props.mes, parseInt(target.value))
}
</script>