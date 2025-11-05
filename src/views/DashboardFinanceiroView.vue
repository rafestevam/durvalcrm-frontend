<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <p class="mt-2 text-sm text-gray-700">
            Visão consolidada de saldos e recebimentos
          </p>
        </div>

        <!-- Period Filters -->
        <div class="mt-4 sm:mt-0 flex gap-2">
          <input
            v-model="dataInicio"
            type="date"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            v-model="dataFim"
            type="date"
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <BaseButton @click="loadDashboard" variant="primary">
            Atualizar
          </BaseButton>
        </div>
      </div>

      <Loading v-if="store.isLoading" />

      <div v-else-if="store.dashboard" class="space-y-6">
        <!-- Consolidated Balance -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium opacity-90">Saldo Total Consolidado</p>
              <p class="text-4xl font-bold mt-2">
                {{ formatCurrency(store.saldoTotal) }}
              </p>
              <p class="text-sm mt-2 opacity-75">
                {{ totalContas }} conta(s) ativa(s)
              </p>
            </div>
          </div>
        </div>

        <!-- Bank Accounts and Cash -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Bank Accounts -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Contas Bancárias</h3>
            <div v-if="store.contasBancarias.length === 0" class="text-gray-500 text-sm">
              Nenhuma conta bancária cadastrada
            </div>
            <div v-else class="space-y-3">
              <router-link
                v-for="conta in store.contasBancarias"
                :key="conta.id"
                :to="`/financeiro/extrato/${conta.id}`"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ conta.nome }}</p>
                  <p class="text-xs text-gray-500">{{ FinalidadeContaLabel[conta.finalidade] }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold" :class="saldoClass(conta.saldoAtual)">
                    {{ formatCurrency(conta.saldoAtual) }}
                  </p>
                  <p class="text-xs text-blue-600">Ver extrato →</p>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Physical Cash -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Caixas Físicos</h3>
            <div v-if="store.caixasFisicos.length === 0" class="text-gray-500 text-sm">
              Nenhum caixa físico cadastrado
            </div>
            <div v-else class="space-y-3">
              <router-link
                v-for="conta in store.caixasFisicos"
                :key="conta.id"
                :to="`/financeiro/extrato/${conta.id}`"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ conta.nome }}</p>
                  <p class="text-xs text-gray-500">{{ FinalidadeContaLabel[conta.finalidade] }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold" :class="saldoClass(conta.saldoAtual)">
                    {{ formatCurrency(conta.saldoAtual) }}
                  </p>
                  <p class="text-xs text-blue-600">Ver extrato →</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Receipts Period Summary -->
        <div v-if="store.recebimentosPeriodo" class="bg-white shadow rounded-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Recebimentos do Período</h3>
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency(store.recebimentosPeriodo.totalPeriodo) }}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- By Payment Method -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Por Forma de Pagamento</h4>
              <div class="space-y-2">
                <div
                  v-for="item in store.recebimentosPeriodo.porFormaPagamento"
                  :key="item.formaPagamento"
                  class="flex justify-between items-center text-sm"
                >
                  <span class="text-gray-600">{{ FormaPagamentoRecebimentoLabel[item.formaPagamento] }}</span>
                  <span class="font-medium">{{ formatCurrency(item.total) }} ({{ item.percentual.toFixed(1) }}%)</span>
                </div>
              </div>
            </div>

            <!-- By Origin -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Por Origem</h4>
              <div class="space-y-2">
                <div
                  v-for="item in store.recebimentosPeriodo.porOrigem"
                  :key="item.origem"
                  class="flex justify-between items-center text-sm"
                >
                  <span class="text-gray-600">{{ OrigemRecebimentoLabel[item.origem] }}</span>
                  <span class="font-medium">{{ formatCurrency(item.total) }} ({{ item.percentual.toFixed(1) }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDashboardFinanceiroStore } from '@/stores/dashboardFinanceiro'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatCurrency } from '@/utils/formatters'
import { FinalidadeContaLabel, FormaPagamentoRecebimentoLabel, OrigemRecebimentoLabel } from '@/types/financeiro'

const store = useDashboardFinanceiroStore()

// Get current month dates
const today = new Date()
const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

const dataInicio = ref(firstDay.toISOString().split('T')[0])
const dataFim = ref(today.toISOString().split('T')[0])

const totalContas = computed(() =>
  (store.contasBancarias?.length || 0) + (store.caixasFisicos?.length || 0)
)

function saldoClass(saldo: number) {
  if (saldo < 0) return 'text-red-600'
  if (saldo === 0) return 'text-gray-600'
  return 'text-green-600'
}

async function loadDashboard() {
  await store.fetchDashboard(dataInicio.value, dataFim.value)
}

// Alias for loading spinner
const Loading = LoadingSpinner

onMounted(() => {
  loadDashboard()
})
</script>
