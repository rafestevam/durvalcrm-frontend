<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Doações</h1>
            <p class="text-sm text-gray-600">
              Gerencie as doações dos associados
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <BaseButton
            variant="primary"
            @click="abrirModalNovaDoacao"
            data-testid="doacao-nova-button"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Doação
          </BaseButton>
        </div>
      </div>
    </template>

      <!-- Filtros de período -->
      <div class="mt-6 bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="dataInicio" class="block text-sm font-medium text-gray-700">
              Data Início
            </label>
            <input
              id="dataInicio"
              v-model="filtros.dataInicio"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              data-testid="doacao-filtro-data-inicio-input"
            />
          </div>
          <div>
            <label for="dataFim" class="block text-sm font-medium text-gray-700">
              Data Fim
            </label>
            <input
              id="dataFim"
              v-model="filtros.dataFim"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              data-testid="doacao-filtro-data-fim-input"
            />
          </div>
          <div class="flex items-end">
            <BaseButton
              variant="primary"
              @click="aplicarFiltros"
              data-testid="doacao-filtrar-button"
            >
              Filtrar
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="mt-6 relative">
        <DoacaoEstatisticas 
          :estatisticas="estatisticas" 
          :loading="loadingEstatisticas" 
        />
        <!-- Notification Tray -->
        <NotificationTray />
      </div>

    <!-- Lista de doações -->
    <div class="mt-8">
      <DoacaoList
        :doacoes="doacoes"
        :loading="loading"
        :error="error"
        @visualizar="visualizarDoacao"
        @editar="editarDoacao"
      />
    </div>

    <!-- Modal Nova/Editar Doação -->
    <div v-if="mostrarModalForm" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="fecharModalForm"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ doacaoEmEdicao ? 'Editar' : 'Nova' }} Doação
            </h3>
            <div class="mt-4">
              <DoacaoForm
                :doacao="doacaoEmEdicao"
                :loading="loadingForm"
                @submit="salvarDoacao"
                @cancelar="fecharModalForm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="mostrarModalDetalhes" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="fecharModalDetalhes"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          <div class="absolute top-0 right-0 pt-4 pr-4">
            <button
              @click="fecharModalDetalhes"
              type="button"
              class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span class="sr-only">Fechar</span>
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <DoacaoDetalhes
            :doacao="doacaoSelecionada"
            @confirmar="confirmarPagamento"
            @cancelar="cancelarDoacao"
            @excluir="excluirDoacao"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDoacoesStore } from '@/stores/doacoes'
import { useNotification } from '@/composables/useNotification'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import NotificationTray from '@/components/common/NotificationTray.vue'
import DoacaoList from '@/components/doacoes/DoacaoList.vue'
import DoacaoForm from '@/components/doacoes/DoacaoForm.vue'
import DoacaoDetalhes from '@/components/doacoes/DoacaoDetalhes.vue'
import DoacaoEstatisticas from '@/components/doacoes/DoacaoEstatisticas.vue'
import type { Doacao, DoacaoFormData } from '@/types/doacao'

const doacoesStore = useDoacoesStore()
const { showSuccess, showError } = useNotification()

const mostrarModalForm = ref(false)
const mostrarModalDetalhes = ref(false)
const doacaoEmEdicao = ref<Doacao | null>(null)
const doacaoSelecionada = ref<Doacao | null>(null)
const loadingForm = ref(false)
const loadingEstatisticas = ref(false)

const filtros = ref({
  dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  dataFim: new Date().toISOString().split('T')[0]
})

const doacoes = computed(() => doacoesStore.doacoesOrdenadas)
const loading = computed(() => doacoesStore.loading)
const error = computed(() => doacoesStore.error)
const estatisticas = computed(() => doacoesStore.estatisticas)

onMounted(async () => {
  await carregarDados()
})

async function carregarDados() {
  await doacoesStore.carregarDoacoes()
  // Carregar estatísticas expandidas para garantir que incluam doações de períodos anteriores
  await carregarEstatisticasExpandidas()
}

async function carregarEstatisticas() {
  loadingEstatisticas.value = true
  try {
    const inicio = new Date(filtros.value.dataInicio)
    const fim = new Date(filtros.value.dataFim)
    fim.setHours(23, 59, 59, 999)
    await doacoesStore.carregarEstatisticas(inicio, fim)
  } catch (error) {
    console.warn('Erro ao carregar estatísticas:', error)
    // Não exibir erro para o usuário - estatísticas são opcionais
  } finally {
    loadingEstatisticas.value = false
  }
}

async function carregarEstatisticasExpandidas() {
  loadingEstatisticas.value = true
  try {
    // Expandir período para os últimos 30 dias para garantir que doações antigas confirmadas hoje sejam incluídas
    const fim = new Date()
    fim.setHours(23, 59, 59, 999)
    const inicio = new Date()
    inicio.setDate(inicio.getDate() - 30)
    inicio.setHours(0, 0, 0, 0)
    
    await doacoesStore.carregarEstatisticas(inicio, fim)
  } catch (error) {
    console.warn('Erro ao carregar estatísticas expandidas:', error)
    // Tentar carregar estatísticas normais como fallback
    await carregarEstatisticas()
  } finally {
    loadingEstatisticas.value = false
  }
}

function aplicarFiltros() {
  carregarEstatisticas()
}

function abrirModalNovaDoacao() {
  doacaoEmEdicao.value = null
  mostrarModalForm.value = true
}

function editarDoacao(doacao: Doacao) {
  doacaoEmEdicao.value = doacao
  mostrarModalForm.value = true
}

function fecharModalForm() {
  mostrarModalForm.value = false
  doacaoEmEdicao.value = null
}

function visualizarDoacao(doacao: Doacao) {
  doacaoSelecionada.value = doacao
  mostrarModalDetalhes.value = true
}

function fecharModalDetalhes() {
  mostrarModalDetalhes.value = false
  doacaoSelecionada.value = null
}

async function salvarDoacao(dados: DoacaoFormData) {
  loadingForm.value = true
  try {
    if (doacaoEmEdicao.value) {
      await doacoesStore.atualizarDoacao(doacaoEmEdicao.value.id, dados)
      showSuccess('Doação atualizada com sucesso!')
    } else {
      await doacoesStore.criarDoacao(dados)
      showSuccess('Doação criada com sucesso!')
    }
    fecharModalForm()
    await carregarEstatisticas()
  } catch (error: any) {
    showError(error.message || 'Erro ao salvar doação')
  } finally {
    loadingForm.value = false
  }
}

async function confirmarPagamento(codigoTransacao: string, metodoPagamento: string) {
  if (!doacaoSelecionada.value) return
  
  try {
    await doacoesStore.confirmarPagamento(
      doacaoSelecionada.value.id, 
      codigoTransacao, 
      metodoPagamento
    )
    // Fechar todas as modais
    fecharModalDetalhes()
    
    showSuccess('Doacao confirmada com sucesso', '', 8000)
    
    // Pequeno delay para garantir que o backend processou a atualização
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Recarregar dados para atualizar estatísticas
    await carregarDados()
    
    // Expandir período das estatísticas para garantir que a doação confirmada seja incluída
    // Buscar estatísticas desde o início do mês até hoje
    await carregarEstatisticasExpandidas()
  } catch (error: any) {
    showError(error.message || 'Erro ao confirmar pagamento')
  }
}

async function cancelarDoacao() {
  if (!doacaoSelecionada.value || !confirm('Tem certeza que deseja cancelar esta doação?')) return
  
  try {
    await doacoesStore.cancelarDoacao(doacaoSelecionada.value.id)
    showSuccess('Doação cancelada com sucesso!')
    fecharModalDetalhes()
    
    // Expandir período das estatísticas para garantir que a doação cancelada seja incluída
    await carregarEstatisticasExpandidas()
  } catch (error: any) {
    showError(error.message || 'Erro ao cancelar doação')
  }
}

async function excluirDoacao() {
  if (!doacaoSelecionada.value || !confirm('Tem certeza que deseja excluir esta doação?')) return
  
  try {
    await doacoesStore.excluirDoacao(doacaoSelecionada.value.id)
    showSuccess('Doação excluída com sucesso!')
    fecharModalDetalhes()
    
    // Expandir período das estatísticas para garantir que as doações restantes sejam incluídas
    await carregarEstatisticasExpandidas()
  } catch (error: any) {
    showError(error.message || 'Erro ao excluir doação')
  }
}
</script>