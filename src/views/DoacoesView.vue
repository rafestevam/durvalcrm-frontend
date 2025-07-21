<template>
  <div class="doacoes-view">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-semibold text-gray-900">Doações</h1>
          <p class="mt-2 text-sm text-gray-700">
            Gerencie as doações dos associados
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            @click="abrirModalNovaDoacao"
            type="button"
            class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Doação
          </button>
        </div>
      </div>

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
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="aplicarFiltros"
              type="button"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="mt-6">
        <DoacaoEstatisticas 
          :estatisticas="estatisticas" 
          :loading="loadingEstatisticas" 
        />
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
              class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDoacoesStore } from '@/stores/doacoes'
import { useNotification } from '@/composables/useNotification'
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
  await carregarEstatisticas()
}

async function carregarEstatisticas() {
  loadingEstatisticas.value = true
  try {
    const inicio = new Date(filtros.value.dataInicio)
    const fim = new Date(filtros.value.dataFim)
    fim.setHours(23, 59, 59, 999)
    await doacoesStore.carregarEstatisticas(inicio, fim)
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
    showSuccess('Pagamento confirmado com sucesso!')
    await carregarEstatisticas()
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
    await carregarEstatisticas()
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
    await carregarEstatisticas()
  } catch (error: any) {
    showError(error.message || 'Erro ao excluir doação')
  }
}
</script>