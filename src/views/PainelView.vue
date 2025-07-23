<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <ChartBarIcon class="h-8 w-8 text-blue-600" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
            <p class="text-sm text-gray-600">
              Acompanhe as finanças da associação
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">Período:</span>
          <select
            v-model="periodoSelecionado"
            @change="carregarDados"
            class="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option v-for="periodo in periodosDisponiveis" :key="periodo.value" :value="periodo.value">
              {{ periodo.label }}
            </option>
          </select>
        </div>
      </div>
    </template>

    <div class="space-y-6">

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Dashboard Content -->
      <div v-else>
        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Receita Consolidada -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100">
              <CurrencyDollarIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Receita Consolidada</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatters.currency(dashboardData?.receitaConsolidada || 0) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Receita de Mensalidades -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <CreditCardIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Receita de Mensalidades</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatters.currency(dashboardData.receitaMensalidades) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Pagantes do Mês -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100">
              <UsersIcon class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pagantes do Mês</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ dashboardData.pagantesMes }} / {{ dashboardData.totalAssociados }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Seção de Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <!-- Gráfico de Receitas por Método de Pagamento -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Receitas por Método de Pagamento</h2>
            <ChartPieIcon class="h-5 w-5 text-gray-400" />
          </div>
          
          <div class="flex flex-col items-center">
            <!-- Gráfico de Rosca -->
            <div class="w-64 h-64">
              <DonutChart 
                :valor-pix="receitasPorMetodo.totalPix" 
                :valor-dinheiro="receitasPorMetodo.totalDinheiro" 
              />
            </div>
            
            <!-- Total Geral -->
            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600">Total Geral</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatters.currency(receitasPorMetodo.totalGeral) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Segunda linha de gráficos e listas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <!-- Gráfico de Receita por Categoria -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Receita por Categoria</h2>
            <ChartBarIcon class="h-5 w-5 text-gray-400" />
          </div>
          
          <div class="space-y-4">
            <!-- Legenda com percentuais -->
            <div class="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>Mensalidades ({{ calcularPorcentagem(dashboardData.receitaMensalidades) }}%)</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Cantina ({{ calcularPorcentagem(dashboardData.receitaCantina) }}%)</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                <span>Bazar ({{ calcularPorcentagem(dashboardData.receitaBazar) }}%)</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-purple-600 rounded mr-2"></div>
                <span>Livros ({{ calcularPorcentagem(dashboardData.receitaLivros) }}%)</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-pink-500 rounded mr-2"></div>
                <span>Doações ({{ calcularPorcentagem(dashboardData.receitaDoacoes) }}%)</span>
              </div>
            </div>

            <!-- Mensalidades -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Mensalidades</span>
                <span class="text-sm font-semibold text-gray-900">
                  {{ formatters.currency(dashboardData.receitaMensalidades) }}
                </span>
              </div>
              <div class="relative w-full bg-gray-100 rounded-full h-2">
                <div
                  class="absolute top-0 left-0 h-2 bg-blue-500 rounded-full transition-all duration-300"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaMensalidades)}%`"
                ></div>
              </div>
            </div>

            <!-- Cantina -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Cantina</span>
                <span class="text-sm font-semibold text-gray-900">
                  {{ formatters.currency(dashboardData.receitaCantina) }}
                </span>
              </div>
              <div class="relative w-full bg-gray-100 rounded-full h-2">
                <div
                  class="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-300"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaCantina)}%`"
                ></div>
              </div>
            </div>

            <!-- Bazar -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Bazar</span>
                <span class="text-sm font-semibold text-gray-900">
                  {{ formatters.currency(dashboardData.receitaBazar) }}
                </span>
              </div>
              <div class="relative w-full bg-gray-100 rounded-full h-2">
                <div
                  class="absolute top-0 left-0 h-2 bg-orange-500 rounded-full transition-all duration-300"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaBazar)}%`"
                ></div>
              </div>
            </div>

            <!-- Livros -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Livros</span>
                <span class="text-sm font-semibold text-gray-900">
                  {{ formatters.currency(dashboardData.receitaLivros) }}
                </span>
              </div>
              <div class="relative w-full bg-gray-100 rounded-full h-2">
                <div
                  class="absolute top-0 left-0 h-2 bg-purple-600 rounded-full transition-all duration-300"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaLivros)}%`"
                ></div>
              </div>
            </div>

            <!-- Doações -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium text-gray-700">Doações</span>
                <span class="text-sm font-semibold text-gray-900">
                  {{ formatters.currency(dashboardData.receitaDoacoes) }}
                </span>
              </div>
              <div class="relative w-full bg-gray-100 rounded-full h-2">
                <div
                  class="absolute top-0 left-0 h-2 bg-pink-500 rounded-full transition-all duration-300"
                  :style="`width: ${calcularPorcentagem(dashboardData.receitaDoacoes)}%`"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Adimplentes/Inadimplentes -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <!-- Adimplentes -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">
                Adimplentes
              </h3>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {{ dashboardData.adimplentes.length }} associados
              </span>
            </div>
            <div class="space-y-3 max-h-48 overflow-y-auto">
              <div v-for="associado in dashboardData.adimplentes.slice(0, 3)" :key="associado.id" class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckIcon class="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ associado.nomeCompleto }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ associado.email }}</p>
                </div>
              </div>
              <p v-if="dashboardData.adimplentes.length > 3" class="text-sm text-gray-500 text-center mt-2">e mais {{ dashboardData.adimplentes.length - 3 }} associados...</p>
            </div>
          </div>

          <!-- Inadimplentes -->
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">
                Inadimplentes
              </h3>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {{ dashboardData.inadimplentes.length }} associados
              </span>
            </div>
            <div class="space-y-3 max-h-48 overflow-y-auto">
              <div v-for="associado in dashboardData.inadimplentes.slice(0, 3)" :key="associado.id" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XMarkIcon class="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ associado.nomeCompleto }}</p>
                    <p class="text-sm text-gray-500 truncate">{{ associado.email }}</p>
                  </div>
                </div>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="gerarCobranca(associado.id)"
                >
                  Gerar Cobrança
                </BaseButton>
              </div>
              <p v-if="dashboardData.inadimplentes.length > 3" class="text-sm text-gray-500 text-center mt-2">e mais {{ dashboardData.inadimplentes.length - 3 }} associados...</p>
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
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  CreditCardIcon, 
  UsersIcon,
  CheckIcon,
  XMarkIcon,
  ChartPieIcon 
} from '@heroicons/vue/24/outline'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import { formatters } from '@/utils/formatters'
import { painelService } from '@/services/painel'
import { mensalidadeService } from '@/services/mensalidade'
import type { DashboardData, ReceitasPorMetodoPagamento } from '@/services/types'
import { useNotification } from '@/composables/useNotification'

// Estado
const defaultDashboardData: DashboardData = {
  receitaConsolidada: 0,
  receitaMensalidades: 0,
  receitaCantina: 0,
  receitaBazar: 0,
  receitaLivros: 0,
  receitaDoacoes: 0,
  pagantesMes: 0,
  totalAssociados: 0,
  adimplentes: [],
  inadimplentes: []
}

const dashboardData = ref<DashboardData>(defaultDashboardData)
const receitasPorMetodo = ref<ReceitasPorMetodoPagamento>({
  totalPix: 0,
  totalDinheiro: 0,
  totalGeral: 0
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

// Dados computados seguros
const dadosSegurosDashboard = computed(() => {
  return dashboardData.value || {
    receitaConsolidada: 0,
    receitaMensalidades: 0,
    receitaCantina: 0,
    receitaBazar: 0,
    receitaLivros: 0,
    receitaDoacoes: 0,
    pagantesMes: 0,
    totalAssociados: 0,
    adimplentes: [],
    inadimplentes: []
  }
})

// Calcular porcentagem para as barras
function calcularPorcentagem(valor: number): number {
  if (dadosSegurosDashboard.value.receitaConsolidada === 0) return 0
  return Math.round((valor / dadosSegurosDashboard.value.receitaConsolidada) * 100)
}

// Carregar dados do dashboard
async function carregarDados() {
  try {
    loading.value = true
    const [mes, ano] = periodoSelecionado.value.split('/')
    console.log(`Carregando dados do dashboard para ${mes}/${ano}`)
    
    // Carregar dados do dashboard e receitas por método em paralelo
    const [dados, receitas] = await Promise.all([
      painelService.obterDashboard(parseInt(mes), parseInt(ano)),
      painelService.obterReceitasPorMetodoPagamento()
    ])
    
    console.log('Dados recebidos:', dados)
    console.log('Receitas por método:', receitas)
    
    // Verificar se os dados são válidos antes de atribuir
    if (dados && typeof dados === 'object') {
      dashboardData.value = dados
    } else {
      console.error('Dados do dashboard inválidos:', dados)
      dashboardData.value = defaultDashboardData
    }
    
    if (receitas && typeof receitas === 'object') {
      console.log('Atualizando receitas por método:', receitas)
      receitasPorMetodo.value = receitas
    }
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
    // Em caso de erro, tentar usar dados mock
    const [mes, ano] = periodoSelecionado.value.split('/')
    try {
      console.log('Tentando fallback para dados mock...')
      const dadosMock = await painelService.obterDashboardMock(parseInt(mes), parseInt(ano))
      dashboardData.value = dadosMock
    } catch (mockError) {
      console.error('Erro ao carregar dados mock:', mockError)
      dashboardData.value = defaultDashboardData
    }
  } finally {
    loading.value = false
  }
}

// Gerar cobrança individual
async function gerarCobranca(associadoId: string | undefined) {
  if (!associadoId) return
  
  const { showSuccess, showError } = useNotification()
  
  try {
    loading.value = true
    const hoje = new Date()
    const mes = hoje.getMonth() + 1
    const ano = hoje.getFullYear()
    
    // Gerar cobrança para o associado
    const resultado = await mensalidadeService.gerarCobrancasIndividual(associadoId, mes, ano)
    
    if (resultado.cobrancasGeradas > 0) {
      showSuccess(`Cobrança gerada com sucesso!`)
      // Recarregar todos os dados do dashboard
      await carregarDados()
    } else {
      showError('Cobrança já existe para este período')
    }
  } catch (error) {
    console.error('Erro ao gerar cobrança:', error)
    showError('Erro ao gerar cobrança')
  } finally {
    loading.value = false
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