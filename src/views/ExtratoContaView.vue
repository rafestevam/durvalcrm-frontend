<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Extrato Detalhado</h1>
          <p class="mt-2 text-sm text-gray-700">
            {{ store.extrato?.nomeConta || 'Carregando...' }}
          </p>
        </div>

        <div class="mt-4 sm:mt-0">
          <router-link
            :to="ROUTES.CONTAS_BANCARIAS"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Voltar para Contas
          </router-link>
        </div>
      </div>

      <Loading v-if="store.isLoading" />

      <div v-else-if="store.extrato" class="space-y-6">
        <!-- Period Filters -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Período</h3>
          <div class="flex gap-4">
            <div class="flex-1">
              <label for="dataInicio" class="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                id="dataInicio"
                v-model="dataInicio"
                type="date"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div class="flex-1">
              <label for="dataFim" class="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                id="dataFim"
                v-model="dataFim"
                type="date"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div class="flex items-end">
              <BaseButton @click="loadExtrato" variant="primary">
                Atualizar
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white shadow rounded-lg p-6">
            <p class="text-sm font-medium text-gray-600">Saldo Inicial</p>
            <p class="text-2xl font-bold mt-2" :class="saldoClass(store.extrato?.saldoInicial || 0)">
              {{ formatCurrency(store.extrato?.saldoInicial || 0) }}
            </p>
          </div>

          <div class="bg-white shadow rounded-lg p-6">
            <p class="text-sm font-medium text-gray-600">Total Entradas</p>
            <p class="text-2xl font-bold text-green-600 mt-2">
              {{ formatCurrency(store.extrato?.totalEntradas || 0) }}
            </p>
          </div>

          <div class="bg-white shadow rounded-lg p-6">
            <p class="text-sm font-medium text-gray-600">Total Saídas</p>
            <p class="text-2xl font-bold text-red-600 mt-2">
              {{ formatCurrency(store.extrato?.totalSaidas || 0) }}
            </p>
          </div>

          <div class="bg-white shadow rounded-lg p-6">
            <p class="text-sm font-medium text-gray-600">Saldo Final</p>
            <p class="text-2xl font-bold mt-2" :class="saldoClass(store.extrato?.saldoFinal || 0)">
              {{ formatCurrency(store.extrato?.saldoFinal || 0) }}
            </p>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Movimentações</h3>
          </div>

          <div v-if="!store.extrato || store.extrato.movimentacoes.length === 0" class="px-6 py-12 text-center">
            <p class="text-gray-500">Nenhuma movimentação encontrada no período selecionado.</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma/Origem
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="mov in store.extrato.movimentacoes" :key="mov.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDateTime(mov.dataHora) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="tipoClass(mov.tipo)"
                    >
                      {{ TipoMovimentacaoLabel[mov.tipo] }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div v-if="mov.formaPagamento">
                        {{ FormaPagamentoRecebimentoLabel[mov.formaPagamento] }}
                      </div>
                      <div v-if="mov.origem" class="text-xs text-gray-500">
                        {{ OrigemRecebimentoLabel[mov.origem] }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ mov.descricao || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold" :class="valorClass(mov.tipo)">
                    {{ formatCurrency(mov.valor) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium" :class="saldoClass(mov.saldoApos)">
                    {{ formatCurrency(mov.saldoApos) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        Nenhum dado encontrado
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardFinanceiroStore } from '@/stores/dashboardFinanceiro'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatCurrency } from '@/utils/formatters'
import { ROUTES } from '@/utils/constants'
import {
  FormaPagamentoRecebimentoLabel,
  OrigemRecebimentoLabel,
  TipoMovimentacaoLabel,
  TipoMovimentacao
} from '@/types/financeiro'

const route = useRoute()
const store = useDashboardFinanceiroStore()

// Get current month dates
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

const dataInicio = ref(firstDay.toISOString().split('T')[0])
const dataFim = ref(today.toISOString().split('T')[0])

const Loading = LoadingSpinner

function formatDateTime(dateTime: string) {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function saldoClass(valor: number) {
  if (valor < 0) return 'text-red-600'
  if (valor === 0) return 'text-gray-600'
  return 'text-green-600'
}

function valorClass(tipo: TipoMovimentacao) {
  if (tipo === TipoMovimentacao.ENTRADA || tipo === TipoMovimentacao.TRANSFERENCIA_ENTRADA) {
    return 'text-green-600'
  }
  return 'text-red-600'
}

function tipoClass(tipo: TipoMovimentacao) {
  if (tipo === TipoMovimentacao.ENTRADA || tipo === TipoMovimentacao.TRANSFERENCIA_ENTRADA) {
    return 'bg-green-100 text-green-800'
  }
  return 'bg-red-100 text-red-800'
}

async function loadExtrato() {
  const contaId = route.params.id as string
  if (contaId) {
    await store.fetchExtrato(contaId, dataInicio.value, dataFim.value)
  }
}

onMounted(() => {
  loadExtrato()
})
</script>
