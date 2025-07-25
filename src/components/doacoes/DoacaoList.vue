<template>
  <div class="doacao-list">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Carregando doações...
      </div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="doacoes.length === 0" class="text-center py-8 text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="mt-2">Nenhuma doação encontrada</p>
    </div>

    <div v-else class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
              Tipo
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th class="relative px-6 py-3">
              <span class="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="doacao in doacoes" :key="doacao.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ doacao.nomeAssociado || 'Anônimo' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatarMoeda(doacao.valor) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                doacao.tipo === 'RECORRENTE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              ]">
                {{ formatarTipo(doacao.tipo) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                statusClass[doacao.status]
              ]">
                {{ formatarStatus(doacao.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatarData(doacao.dataDoacao) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="$emit('visualizar', doacao)"
                class="text-indigo-600 hover:text-indigo-900 mr-3"
              >
                Visualizar
              </button>
              <button
                v-if="podeEditar(doacao)"
                @click="$emit('editar', doacao)"
                class="text-indigo-600 hover:text-indigo-900"
              >
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { computed } from 'vue' // Unused import
import type { Doacao, StatusDoacao } from '@/types/doacao'

interface Props {
  doacoes: Doacao[]
  loading?: boolean
  error?: string | null
}

defineProps<Props>()

defineEmits<{
  visualizar: [doacao: Doacao]
  editar: [doacao: Doacao]
}>()

const statusClass: Record<StatusDoacao, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  PROCESSANDO: 'bg-blue-100 text-blue-800',
  CONFIRMADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800'
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarStatus(status: StatusDoacao): string {
  const statusMap: Record<StatusDoacao, string> = {
    PENDENTE: 'Pendente',
    PROCESSANDO: 'Processando',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada'
  }
  return statusMap[status] || status
}

function formatarTipo(tipo: string): string {
  return tipo === 'RECORRENTE' ? 'Recorrente' : 'Única'
}

function podeEditar(doacao: Doacao): boolean {
  return doacao.status === 'PENDENTE' || doacao.status === 'PROCESSANDO'
}
</script>