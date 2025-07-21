<template>
  <div class="bg-white rounded-lg shadow">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Estatísticas de Doações</h3>
    </div>
    
    <div v-if="loading" class="p-6 text-center">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Carregando estatísticas...
      </div>
    </div>
    
    <div v-else-if="estatisticas" class="p-6">
      <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Total Arrecadado
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatarMoeda(estatisticas.totalArrecadado) }}
            </dd>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Total de Doações
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ estatisticas.totalDoacoes }}
            </dd>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Ticket Médio
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ formatarMoeda(estatisticas.ticketMedio) }}
            </dd>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Confirmadas
            </dt>
            <dd class="mt-1">
              <span class="text-2xl font-semibold text-green-600">
                {{ estatisticas.doacoesConfirmadas }}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                ({{ calcularPercentual(estatisticas.doacoesConfirmadas) }}%)
              </span>
            </dd>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Pendentes
            </dt>
            <dd class="mt-1">
              <span class="text-2xl font-semibold text-yellow-600">
                {{ estatisticas.doacoesPendentes }}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                ({{ calcularPercentual(estatisticas.doacoesPendentes) }}%)
              </span>
            </dd>
          </div>
        </div>
        
        <div class="bg-white overflow-hidden rounded-lg border border-gray-200">
          <div class="px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-gray-500 truncate">
              Canceladas
            </dt>
            <dd class="mt-1">
              <span class="text-2xl font-semibold text-red-600">
                {{ estatisticas.doacoesCanceladas }}
              </span>
              <span class="ml-2 text-sm text-gray-500">
                ({{ calcularPercentual(estatisticas.doacoesCanceladas) }}%)
              </span>
            </dd>
          </div>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DoacaoEstatisticas } from '@/types/doacao'

interface Props {
  estatisticas: DoacaoEstatisticas | null
  loading?: boolean
}

const props = defineProps<Props>()

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

function calcularPercentual(valor: number): string {
  if (!props.estatisticas || props.estatisticas.totalDoacoes === 0) {
    return '0'
  }
  const percentual = (valor / props.estatisticas.totalDoacoes) * 100
  return percentual.toFixed(1)
}
</script>