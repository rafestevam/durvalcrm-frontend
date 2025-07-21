<template>
  <div v-if="doacao" class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        Detalhes da Doação
      </h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">
        Informações completas sobre a doação
      </p>
    </div>
    
    <div class="border-t border-gray-200">
      <dl>
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">ID</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            #{{ doacao.id }}
          </dd>
        </div>
        
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Associado</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {{ doacao.nomeAssociado || 'Anônimo' }}
          </dd>
        </div>
        
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Valor</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <span class="text-lg font-semibold">{{ formatarMoeda(doacao.valor) }}</span>
          </dd>
        </div>
        
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Tipo</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <span :class="[
              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
              doacao.tipo === 'RECORRENTE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            ]">
              {{ formatarTipo(doacao.tipo) }}
            </span>
          </dd>
        </div>
        
        <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Status</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <span :class="[
              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
              statusClass[doacao.status]
            ]">
              {{ formatarStatus(doacao.status) }}
            </span>
          </dd>
        </div>
        
        <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Data da Doação</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {{ formatarDataCompleta(doacao.dataDoacao) }}
          </dd>
        </div>
        
        <div v-if="doacao.dataConfirmacao" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Data de Confirmação</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {{ formatarDataCompleta(doacao.dataConfirmacao) }}
          </dd>
        </div>
        
        <div v-if="doacao.codigoTransacao" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Código da Transação</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
            {{ doacao.codigoTransacao }}
          </dd>
        </div>
        
        <div v-if="doacao.metodoPagamento" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Método de Pagamento</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {{ doacao.metodoPagamento }}
          </dd>
        </div>
        
        <div v-if="doacao.descricao" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Descrição</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {{ doacao.descricao }}
          </dd>
        </div>
      </dl>
    </div>
    
    <div class="bg-gray-50 px-4 py-4 sm:px-6">
      <div class="flex justify-end space-x-3">
        <button
          v-if="doacao.status === 'PENDENTE'"
          @click="mostrarModalPix = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Gerar PIX
        </button>
        
        <button
          v-if="podeConfirmar"
          @click="mostrarModalConfirmacao = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Confirmar Pagamento
        </button>
        
        <button
          v-if="podeCancelar"
          @click="$emit('cancelar')"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Cancelar Doação
        </button>
        
        <button
          v-if="podeExcluir"
          @click="$emit('excluir')"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Excluir
        </button>
      </div>
    </div>
    
    <!-- Modal PIX -->
    <div v-if="mostrarModalPix" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="mostrarModalPix = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Código PIX
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Use o código abaixo para pagar via PIX:
                </p>
                <div v-if="loadingPix" class="mt-4">
                  <svg class="animate-spin h-5 w-5 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <div v-else-if="codigoPix" class="mt-4 p-3 bg-gray-100 rounded-md">
                  <p class="text-xs font-mono break-all">{{ codigoPix }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6">
            <button
              type="button"
              @click="copiarCodigoPix"
              :disabled="!codigoPix"
              class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
            >
              {{ copiado ? 'Copiado!' : 'Copiar Código' }}
            </button>
            <button
              type="button"
              @click="mostrarModalPix = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Confirmação de Pagamento -->
    <div v-if="mostrarModalConfirmacao" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="mostrarModalConfirmacao = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <form @submit.prevent="confirmarPagamento">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Confirmar Pagamento
              </h3>
              <div class="mt-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Código da Transação
                  </label>
                  <input
                    v-model="dadosConfirmacao.codigoTransacao"
                    type="text"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Método de Pagamento
                  </label>
                  <select
                    v-model="dadosConfirmacao.metodoPagamento"
                    required
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Selecione...</option>
                    <option :value="MetodoPagamento.PIX">PIX</option>
                    <option :value="MetodoPagamento.DINHEIRO">Dinheiro</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
              >
                Confirmar
              </button>
              <button
                type="button"
                @click="mostrarModalConfirmacao = false"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDoacoesStore } from '@/stores/doacoes'
import { MetodoPagamento } from '@/types/doacao'
import type { Doacao, StatusDoacao } from '@/types/doacao'

interface Props {
  doacao: Doacao | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirmar: [codigoTransacao: string, metodoPagamento: string]
  cancelar: []
  excluir: []
}>()

const doacoesStore = useDoacoesStore()

const mostrarModalPix = ref(false)
const mostrarModalConfirmacao = ref(false)
const codigoPix = ref('')
const loadingPix = ref(false)
const copiado = ref(false)

const dadosConfirmacao = ref({
  codigoTransacao: '',
  metodoPagamento: ''
})

const statusClass: Record<StatusDoacao, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  PROCESSANDO: 'bg-blue-100 text-blue-800',
  CONFIRMADA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-red-100 text-red-800'
}

const podeConfirmar = computed(() => 
  props.doacao && (props.doacao.status === 'PENDENTE' || props.doacao.status === 'PROCESSANDO')
)

const podeCancelar = computed(() => 
  props.doacao && props.doacao.status !== 'CONFIRMADA' && props.doacao.status !== 'CANCELADA'
)

const podeExcluir = computed(() => 
  props.doacao && props.doacao.status !== 'CONFIRMADA'
)

watch(mostrarModalPix, async (novo) => {
  if (novo && props.doacao) {
    loadingPix.value = true
    try {
      codigoPix.value = await doacoesStore.gerarCodigoPix(props.doacao.id)
    } catch (error) {
      console.error('Erro ao gerar código PIX:', error)
    } finally {
      loadingPix.value = false
    }
  } else {
    codigoPix.value = ''
    copiado.value = false
  }
})

async function copiarCodigoPix() {
  if (codigoPix.value) {
    await navigator.clipboard.writeText(codigoPix.value)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  }
}

function confirmarPagamento() {
  emit('confirmar', dadosConfirmacao.value.codigoTransacao, dadosConfirmacao.value.metodoPagamento)
  // Fechar todas as modais internas
  mostrarModalConfirmacao.value = false
  mostrarModalPix.value = false
  dadosConfirmacao.value = {
    codigoTransacao: '',
    metodoPagamento: ''
  }
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

function formatarDataCompleta(data: string): string {
  return new Date(data).toLocaleString('pt-BR')
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
</script>