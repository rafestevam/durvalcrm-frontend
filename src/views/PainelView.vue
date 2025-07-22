<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Cabeçalho -->
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        
        <!-- Seletor de Período -->
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">Exibindo dados de:</span>
          <div class="relative">
            <select
              v-model="periodoSelecionado"
              @change="carregarDados"
              class="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option v-for="periodo in periodosDisponiveis" :key="periodo.value" :value="periodo.value">
                {{ periodo.label }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards de Resumo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Receita Consolidada -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-600 text-sm font-medium">Receita Consolidada</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">
            {{ formatters.currency(dashboardData.receitaConsolidada) }}
          </p>
        </div>

        <!-- Receita de Mensalidades -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-600 text-sm font-medium">Receita de Mensalidades</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">
            {{ formatters.currency(dashboardData.receitaMensalidades) }}
          </p>
        </div>

        <!-- Pagantes do Mês -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-gray-600 text-sm font-medium">Pagantes do Mês</h3>
          <p class="text-3xl font-bold text-gray-800 mt-2">
            {{ dashboardData.pagantesMes }} / {{ dashboardData.totalAssociados }}
          </p>
        </div>
      </div>

      <!-- Seção inferior com gráfico e listas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gráfico de Receita por Categoria -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Receita por Categoria</h2>
          
          <div class="space-y-4">
            <!-- Mensalidades -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Mensalidades</span>
                <span class="text-sm font-medium text-gray-800">
                  {{ formatters.currency(dashboardData.receitaMensalidades) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-5">
                <div
                  class="bg-blue-500 h-5 rounded-full"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaMensalidades)}%`"
                ></div>
              </div>
            </div>

            <!-- Cantina -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Cantina</span>
                <span class="text-sm font-medium text-gray-800">
                  {{ formatters.currency(dashboardData.receitaCantina) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-5">
                <div
                  class="bg-green-500 h-5 rounded-full"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaCantina)}%`"
                ></div>
              </div>
            </div>

            <!-- Bazar -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Bazar</span>
                <span class="text-sm font-medium text-gray-800">
                  {{ formatters.currency(dashboardData.receitaBazar) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-5">
                <div
                  class="bg-orange-500 h-5 rounded-full"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaBazar)}%`"
                ></div>
              </div>
            </div>

            <!-- Livros -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-gray-600">Livros</span>
                <span class="text-sm font-medium text-gray-800">
                  {{ formatters.currency(dashboardData.receitaLivros) }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-5">
                <div
                  class="bg-purple-600 h-5 rounded-full"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaLivros)}%`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Adimplentes/Inadimplentes -->
        <div class="bg-white rounded-lg shadow p-6">
          <!-- Adimplentes -->
          <div class="mb-6">
            <h3 class="text-lg font-bold text-green-600 mb-4">
              ✅ Adimplentes ({{ dashboardData.adimplentes.length }})
            </h3>
            <div class="space-y-3 max-h-40 overflow-y-auto">
              <div v-for="associado in dashboardData.adimplentes.slice(0, 3)" :key="associado.id">
                <p class="font-medium text-gray-700">{{ associado.nomeCompleto }}</p>
                <p class="text-sm text-gray-500">{{ associado.email }}</p>
              </div>
              <p v-if="dashboardData.adimplentes.length > 3" class="text-gray-400">(...)</p>
            </div>
          </div>

          <div class="border-t pt-6">
            <!-- Inadimplentes -->
            <h3 class="text-lg font-bold text-red-600 mb-4">
              ❌ Inadimplentes ({{ dashboardData.inadimplentes.length }})
            </h3>
            <div class="space-y-3">
              <div v-for="associado in dashboardData.inadimplentes.slice(0, 3)" :key="associado.id" class="flex justify-between items-center">
                <div>
                  <p class="font-medium text-gray-700">{{ associado.nomeCompleto }}</p>
                  <p class="text-sm text-gray-500">{{ associado.email }}</p>
                </div>
                <button
                  @click="gerarCobranca(associado.id)"
                  class="px-4 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200"
                >
                  Gerar Cobrança
                </button>
              </div>
              <p v-if="dashboardData.inadimplentes.length > 3" class="text-gray-400">(...)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { formatters } from '@/utils/formatters'
import { painelService } from '@/services/painel'
import type { DashboardData } from '@/services/types'

// Estado
const dashboardData = ref<DashboardData>({
  receitaConsolidada: 0,
  receitaMensalidades: 0,
  receitaCantina: 0,
  receitaBazar: 0,
  receitaLivros: 0,
  pagantesMes: 0,
  totalAssociados: 0,
  adimplentes: [],
  inadimplentes: []
})

const periodoSelecionado = ref('')
const loading = ref(false)

// Períodos disponíveis
const periodosDisponiveis = computed(() => {
  const periodos = []
  const hoje = new Date()
  
  for (let i = 0; i < 6; i++) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const mes = data.toLocaleDateString('pt-BR', { month: 'long' })
    const ano = data.getFullYear()
    const value = `${data.getMonth() + 1}/${ano}`
    const label = `${mes.charAt(0).toUpperCase() + mes.slice(1)} / ${ano}`
    
    periodos.push({ value, label })
  }
  
  return periodos
})

// Calcular porcentagem para as barras
function calcularPorcentagem(valor: number): number {
  if (dashboardData.value.receitaConsolidada === 0) return 0
  return Math.round((valor / dashboardData.value.receitaConsolidada) * 100)
}

// Carregar dados do dashboard
async function carregarDados() {
  try {
    loading.value = true
    const [mes, ano] = periodoSelecionado.value.split('/')
    const dados = await painelService.obterDashboard(parseInt(mes), parseInt(ano))
    dashboardData.value = dados
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
  } finally {
    loading.value = false
  }
}

// Gerar cobrança individual
async function gerarCobranca(associadoId: string | undefined) {
  if (!associadoId) return
  
  try {
    // Implementar lógica de geração de cobrança
    console.log('Gerar cobrança para:', associadoId)
  } catch (error) {
    console.error('Erro ao gerar cobrança:', error)
  }
}

onMounted(() => {
  // Definir período atual
  const hoje = new Date()
  periodoSelecionado.value = `${hoje.getMonth() + 1}/${hoje.getFullYear()}`
  
  // Carregar dados
  carregarDados()
})
</script>