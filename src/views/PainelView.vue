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

      <!-- Seção de Gráficos e Listas -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <!-- Coluna da Esquerda: Gráficos (2/3 da largura) -->
        <div class="lg:col-span-2 space-y-8">
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
        </div>

        <!-- Coluna da Direita: Lista de Adimplentes/Inadimplentes (1/3 da largura) -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          <!-- Adimplentes -->
          <div class="p-6 border-b border-gray-200 flex-1">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                Adimplentes
              </h3>
              <p class="text-sm text-gray-600">
                {{ dashboardData.adimplentes.length }} {{ dashboardData.adimplentes.length === 1 ? 'associado' : 'associados' }}
              </p>
            </div>

            <div class="space-y-2 min-h-[320px]">
              <div v-for="associado in adimplentesPaginados" :key="associado.id" class="flex items-center space-x-2 py-1.5 border-b border-gray-100 last:border-0">
                <div class="flex-shrink-0">
                  <CheckIcon class="h-4 w-4 text-green-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 truncate">
                    <span class="font-medium">{{ associado.nomeCompleto }}</span>
                    <span class="text-gray-500 ml-1">{{ associado.email }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Paginação -->
            <div v-if="totalPaginasAdimplentes > 1" class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-center space-x-2">
                <button
                  @click="paginaAdimplentes--"
                  :disabled="paginaAdimplentes === 1"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded',
                    paginaAdimplentes === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  &lt; Anterior
                </button>

                <div class="flex items-center space-x-1">
                  <button
                    v-for="pagina in paginasVisiveis(totalPaginasAdimplentes, paginaAdimplentes)"
                    :key="pagina"
                    @click="paginaAdimplentes = pagina"
                    :class="[
                      'px-3 py-1 text-sm font-medium rounded',
                      paginaAdimplentes === pagina
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    ]"
                  >
                    {{ pagina }}
                  </button>
                </div>

                <button
                  @click="paginaAdimplentes++"
                  :disabled="paginaAdimplentes === totalPaginasAdimplentes"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded',
                    paginaAdimplentes === totalPaginasAdimplentes
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  Próximo &gt;
                </button>
              </div>
            </div>
          </div>

          <!-- Inadimplentes -->
          <div class="p-6 flex-1">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">
                Inadimplentes
              </h3>
              <p class="text-sm text-gray-600">
                {{ dashboardData.inadimplentes.length }} {{ dashboardData.inadimplentes.length === 1 ? 'associado' : 'associados' }}
              </p>
            </div>

            <div class="space-y-2 min-h-[320px]">
              <div v-for="associado in inadimplentesPaginados" :key="associado.id" class="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <div class="flex items-center space-x-2 flex-1 min-w-0 mr-3">
                  <div class="flex-shrink-0">
                    <XMarkIcon class="h-4 w-4 text-red-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 truncate">
                      <span class="font-medium">{{ associado.nomeCompleto }}</span>
                      <span class="text-gray-500 ml-1">{{ associado.email }}</span>
                    </p>
                  </div>
                </div>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="gerarCobranca(associado.id)"
                  class="flex-shrink-0 text-xs px-2 py-1"
                >
                  Gerar Cobrança
                </BaseButton>
              </div>
            </div>

            <!-- Paginação -->
            <div v-if="totalPaginasInadimplentes > 1" class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-center space-x-2">
                <button
                  @click="paginaInadimplentes--"
                  :disabled="paginaInadimplentes === 1"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded',
                    paginaInadimplentes === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  &lt; Anterior
                </button>

                <div class="flex items-center space-x-1">
                  <button
                    v-for="pagina in paginasVisiveis(totalPaginasInadimplentes, paginaInadimplentes)"
                    :key="pagina"
                    @click="paginaInadimplentes = pagina"
                    :class="[
                      'px-3 py-1 text-sm font-medium rounded',
                      paginaInadimplentes === pagina
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    ]"
                  >
                    {{ pagina }}
                  </button>
                </div>

                <button
                  @click="paginaInadimplentes++"
                  :disabled="paginaInadimplentes === totalPaginasInadimplentes"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded',
                    paginaInadimplentes === totalPaginasInadimplentes
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  ]"
                >
                  Próximo &gt;
                </button>
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

// Paginação
const REGISTROS_POR_PAGINA = 10
const paginaAdimplentes = ref(1)
const paginaInadimplentes = ref(1)

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

// Computed properties para paginação de adimplentes
const totalPaginasAdimplentes = computed(() => {
  return Math.ceil(dashboardData.value.adimplentes.length / REGISTROS_POR_PAGINA)
})

const adimplentesPaginados = computed(() => {
  const inicio = (paginaAdimplentes.value - 1) * REGISTROS_POR_PAGINA
  const fim = inicio + REGISTROS_POR_PAGINA
  return dashboardData.value.adimplentes.slice(inicio, fim)
})

// Computed properties para paginação de inadimplentes
const totalPaginasInadimplentes = computed(() => {
  return Math.ceil(dashboardData.value.inadimplentes.length / REGISTROS_POR_PAGINA)
})

const inadimplentesPaginados = computed(() => {
  const inicio = (paginaInadimplentes.value - 1) * REGISTROS_POR_PAGINA
  const fim = inicio + REGISTROS_POR_PAGINA
  return dashboardData.value.inadimplentes.slice(inicio, fim)
})

// Função para gerar array de páginas visíveis
function paginasVisiveis(totalPaginas: number, paginaAtual: number): number[] {
  const paginas: number[] = []
  const maxPaginasVisiveis = 5

  if (totalPaginas <= maxPaginasVisiveis) {
    // Se tem poucas páginas, mostra todas
    for (let i = 1; i <= totalPaginas; i++) {
      paginas.push(i)
    }
  } else {
    // Lógica para mostrar páginas próximas à atual
    let inicio = Math.max(1, paginaAtual - 2)
    let fim = Math.min(totalPaginas, paginaAtual + 2)

    // Ajustar se estiver no início
    if (paginaAtual <= 3) {
      fim = Math.min(maxPaginasVisiveis, totalPaginas)
    }

    // Ajustar se estiver no final
    if (paginaAtual >= totalPaginas - 2) {
      inicio = Math.max(1, totalPaginas - maxPaginasVisiveis + 1)
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i)
    }
  }

  return paginas
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
      // Resetar páginas para 1 quando novos dados são carregados
      paginaAdimplentes.value = 1
      paginaInadimplentes.value = 1
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