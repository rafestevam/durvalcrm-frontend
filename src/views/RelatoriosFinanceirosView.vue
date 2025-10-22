<template>
  <AppLayout>
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
        <p class="mt-2 text-sm text-gray-700">Visualize resumos e análises financeiras</p>
      </div>

      <!-- Filtro de Período -->
      <div class="bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput v-model="filtros.dataInicio" type="date" label="Data Início" />
          <BaseInput v-model="filtros.dataFim" type="date" label="Data Fim" />
          <div class="flex items-end gap-2">
            <BaseButton variant="outline" @click="carregarResumoMesAtual" class="flex-1">Mês Atual</BaseButton>
            <BaseButton variant="primary" @click="carregar" class="flex-1">Buscar</BaseButton>
          </div>
        </div>
      </div>

      <!-- Cards de Resumo -->
      <div v-if="store.resumo" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Receitas</p>
              <p class="mt-2 text-3xl font-bold text-green-600">
                {{ formatarValor(store.resumo.totalReceitas) }}
              </p>
              <p class="mt-1 text-sm text-gray-500">{{ store.resumo.quantidadeReceitas }} receitas</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Despesas</p>
              <p class="mt-2 text-3xl font-bold text-red-600">
                {{ formatarValor(store.resumo.totalDespesas) }}
              </p>
              <p class="mt-1 text-sm text-gray-500">{{ store.resumo.quantidadeDespesas }} despesas</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Saldo</p>
              <p class="mt-2 text-3xl font-bold" :class="store.resumo.saldo >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatarValor(store.resumo.saldo) }}
              </p>
              <p class="mt-1 text-sm text-gray-500">Período selecionado</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Receitas por Categoria -->
      <div v-if="store.receitasPorCategoria.length > 0" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Receitas por Categoria</h2>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Percentual</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="item in store.receitasPorCategoria" :key="item.categoriaId">
                <td class="font-medium">
                  <div class="flex items-center gap-2">
                    <div v-if="item.categoriaCor" class="w-4 h-4 rounded-full" :style="{ backgroundColor: item.categoriaCor }"></div>
                    {{ item.categoriaNome }}
                  </div>
                </td>
                <td>{{ item.quantidade }}</td>
                <td class="text-green-600 font-semibold">{{ formatarValor(item.total) }}</td>
                <td>{{ item.percentual.toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Despesas por Categoria -->
      <div v-if="store.despesasPorCategoria.length > 0" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h2>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Percentual</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="item in store.despesasPorCategoria" :key="item.categoriaId">
                <td class="font-medium">
                  <div class="flex items-center gap-2">
                    <div v-if="item.categoriaCor" class="w-4 h-4 rounded-full" :style="{ backgroundColor: item.categoriaCor }"></div>
                    {{ item.categoriaNome }}
                  </div>
                </td>
                <td>{{ item.quantidade }}</td>
                <td class="text-red-600 font-semibold">{{ formatarValor(item.total) }}</td>
                <td>{{ item.percentual.toFixed(1) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Fluxo de Caixa -->
      <div v-if="store.fluxoCaixa" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Fluxo de Caixa Mensal</h2>
        <div class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Período</th>
                <th>Receitas</th>
                <th>Despesas</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="mov in store.fluxoCaixa.movimentacoes" :key="`${mov.mes}-${mov.ano}`">
                <td class="font-medium">{{ mov.mesAno }}</td>
                <td class="text-green-600">{{ formatarValor(mov.totalReceitas) }}</td>
                <td class="text-red-600">{{ formatarValor(mov.totalDespesas) }}</td>
                <td :class="mov.saldo >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ formatarValor(mov.saldo) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="store.isLoading" class="flex justify-center items-center py-12">
        <LoadingSpinner class="w-12 h-12" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRelatorioFinanceiroStore } from '@/stores/relatorioFinanceiro'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const store = useRelatorioFinanceiroStore()

const filtros = ref({
  dataInicio: getFirstDayOfMonth(),
  dataFim: getLastDayOfMonth()
})

function getFirstDayOfMonth() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
}

function getLastDayOfMonth() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
}

function formatarValor(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

async function carregar() {
  try {
    await Promise.all([
      store.fetchResumoFinanceiro(filtros.value.dataInicio, filtros.value.dataFim),
      store.fetchReceitasPorCategoria(filtros.value.dataInicio, filtros.value.dataFim),
      store.fetchDespesasPorCategoria(filtros.value.dataInicio, filtros.value.dataFim),
      store.fetchFluxoDeCaixa(filtros.value.dataInicio, filtros.value.dataFim)
    ])
  } catch (error: any) {
    alert(error.message || 'Erro ao carregar relatórios')
  }
}

async function carregarResumoMesAtual() {
  filtros.value.dataInicio = getFirstDayOfMonth()
  filtros.value.dataFim = getLastDayOfMonth()
  await carregar()
}

onMounted(() => {
  carregar()
})
</script>
