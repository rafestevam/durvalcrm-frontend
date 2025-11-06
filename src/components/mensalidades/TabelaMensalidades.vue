<template>
  <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
    <table class="min-w-full divide-y divide-gray-300">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Associado
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Valor
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Vencimento
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Ações
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="mensalidade in mensalidades" :key="mensalidade.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">
              {{ mensalidade.nomeAssociado || 'Nome não disponível' }}
            </div>
            <div class="text-sm text-gray-500">
              ID: {{ mensalidade.identificadorPix }}
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ formatters.money(mensalidade.valor) }}
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap">
            <span 
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
              :class="getStatusClass(mensalidade.status)"
            >
              {{ getStatusLabel(mensalidade.status) }}
            </span>
            <div v-if="mensalidade.vencida && mensalidade.status === 'PENDENTE'" 
                 class="text-xs text-red-600 mt-1">
              Vencida
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ formatters.date(mensalidade.dataVencimento) }}
            <div v-if="mensalidade.dataPagamento" class="text-xs text-green-600">
              Pago em {{ formatters.date(mensalidade.dataPagamento) }}
            </div>
          </td>
          
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
            <button
              :id="`mensalidade-ver-qrcode-${mensalidade.id}`"
              type="button"
              @click="handleVerQRCode(mensalidade)"
              class="text-blue-600 hover:text-blue-900"
            >
              Ver QR Code
            </button>

            <button
              v-if="mensalidade.status !== 'PAGA'"
              :id="`mensalidade-marcar-paga-${mensalidade.id}`"
              type="button"
              @click="$emit('marcar-paga', mensalidade)"
              class="text-green-600 hover:text-green-900 ml-3"
            >
              Marcar como Paga
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Estado vazio -->
    <div v-if="mensalidades.length === 0" class="text-center py-12">
      <CurrencyDollarIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">
        Nenhuma mensalidade encontrada
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        Gere as cobranças para este período.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import { formatters } from '@/utils/formatters'
import type { Mensalidade, StatusMensalidade } from '@/services/types'

interface Props {
  mensalidades: Mensalidade[]
}

interface Emits {
  (e: 'ver-qr-code', mensalidade: Mensalidade): void
  (e: 'marcar-paga', mensalidade: Mensalidade): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function getStatusClass(status: StatusMensalidade): string {
  const classes = {
    PENDENTE: 'bg-yellow-100 text-yellow-800',
    PAGA: 'bg-green-100 text-green-800',
    ATRASADA: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status: StatusMensalidade): string {
  const labels = {
    PENDENTE: 'Pendente',
    PAGA: 'Paga',
    ATRASADA: 'Atrasada'
  }
  return labels[status] || status
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleVerQRCode(mensalidade: Mensalidade) {
  // Evitar múltiplos cliques
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  
  debounceTimer = setTimeout(() => {
    console.log('Clicou em Ver QR Code para mensalidade:', mensalidade.id)
    console.log('Emitindo evento ver-qr-code...')
    emit('ver-qr-code', mensalidade)
    debounceTimer = null
  }, 100)
}
</script>