<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Cabeçalho -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Registro de Vendas</h1>
        <p class="mt-2 text-sm text-gray-700">
          Registre vendas da cantina, bazar e livros
        </p>
      </div>

      <!-- Formulário de Registro -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <form @submit.prevent="registrarVenda" class="space-y-6">
            <!-- Descrição -->
            <div>
              <BaseInput
                v-model="forma.descricao"
                type="text"
                label="Descrição da Venda"
                placeholder="Ex: Lanche, Livro de História, etc."
                required
                :error="errors.descricao"
                data-testid="venda-descricao-input"
              />
            </div>

            <!-- Valor -->
            <div>
              <BaseInput
                v-model="forma.valor"
                type="number"
                step="0.01"
                label="Valor da Venda (R$)"
                placeholder="15,00"
                required
                :error="errors.valor"
                data-testid="venda-valor-input"
              />
            </div>


            <!-- Origem -->
            <div>
              <label class="form-label">Origem da Venda</label>
              <div class="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  v-for="origem in VENDA_ORIGENS"
                  :key="origem.value"
                  type="button"
                  class="flex items-center justify-center px-6 py-4 border-2 rounded-lg text-lg font-medium transition-colors"
                  :class="[
                    forma.origem === origem.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  ]"
                  :data-testid="`venda-origem-${origem.value.toLowerCase()}-button`"
                  @click="forma.origem = origem.value"
                >
                  {{ origem.label }}
                </button>
              </div>
              <p v-if="errors.origem" class="form-error">{{ errors.origem }}</p>
            </div>


            <!-- Opções de Pagamento - US-067 -->
            <div>
              <label class="form-label">Forma de Pagamento</label>
              <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  v-for="forma_pag in FORMAS_PAGAMENTO_VENDA"
                  :key="forma_pag.value"
                  type="button"
                  class="flex flex-col items-center justify-center px-4 py-3 border-2 rounded-lg font-medium transition-colors"
                  :class="[
                    forma.formaPagamento === forma_pag.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  ]"
                  :data-testid="`venda-forma-pagamento-${forma_pag.value.toLowerCase().replace(/_/g, '-')}-button`"
                  @click="forma.formaPagamento = forma_pag.value"
                >
                  <span class="text-2xl mb-1">{{ forma_pag.icon }}</span>
                  <span class="text-sm text-center">{{ forma_pag.label }}</span>
                </button>
              </div>
              <p v-if="errors.formaPagamento" class="form-error">{{ errors.formaPagamento }}</p>
            </div>

            <!-- Seleção de Conta Bancária - US-067 -->
            <div v-if="forma.formaPagamento && contasDisponiveis.length > 0">
              <label class="form-label">
                Conta Bancária
                <span class="text-sm font-normal text-gray-500">(opcional)</span>
              </label>
              <select
                v-model="forma.contaBancariaId"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                data-testid="venda-conta-bancaria-select"
              >
                <option value="">Seleção automática</option>
                <option
                  v-for="conta in contasDisponiveis"
                  :key="conta.id"
                  :value="conta.id"
                >
                  {{ conta.nome }} - Saldo: {{ formatters.currency(conta.saldoAtual) }}
                </option>
              </select>
              <p v-if="mensagemContaAutomatica" class="mt-1 text-sm" :class="contasDisponiveis.length > 0 ? 'text-green-600' : 'text-red-600'">
                {{ mensagemContaAutomatica }}
              </p>
              <p v-if="errors.contaBancaria" class="form-error">{{ errors.contaBancaria }}</p>
            </div>

            <!-- Alerta quando não há conta configurada - US-067 -->
            <div v-if="forma.formaPagamento && contasDisponiveis.length === 0" class="rounded-md bg-yellow-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Nenhuma conta configurada</h3>
                  <p class="mt-1 text-sm text-yellow-700">
                    Configure uma conta bancária para esta forma de pagamento antes de registrar vendas.
                  </p>
                </div>
              </div>
            </div>

            <!-- Data (informativa) -->
            <div>
              <p class="text-sm text-gray-600">
                Data da Venda: {{ formatters.date(new Date()) }} (preenchido automaticamente)
              </p>
            </div>

            <!-- Botão -->
            <div>
              <BaseButton
                type="submit"
                variant="success"
                size="lg"
                :loading="isSubmitting"
                :full-width="true"
                data-testid="venda-submit-button"
              >
                REGISTRAR VENDA
              </BaseButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Vendas Recentes -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Vendas Recentes</h2>
          
          <div v-if="vendasStore.vendasRecentes.length === 0" class="text-center py-4">
            <ShoppingCartIcon class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600">Nenhuma venda registrada recentemente</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="venda in vendasStore.vendasRecentes"
              :key="venda.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ venda.descricao }}</p>
                <p class="text-sm text-gray-600">
                  {{ getOrigemLabel(venda.origem) }} • {{ getFormaPagamentoLabel(venda.formaPagamento) }}
                </p>
                <p class="text-xs text-gray-500">{{ formatters.datetime(venda.dataVenda) }}</p>
              </div>
              <div class="text-lg font-semibold text-success-600">
                {{ formatters.currency(venda.valor) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerta de Sucesso -->
    <AlertMessage
      v-if="showSuccessAlert"
      type="success"
      title="Venda Registrada!"
      message="A venda foi registrada com sucesso."
      :auto-hide="true"
      @dismiss="showSuccessAlert = false"
    />

    <!-- Alerta de Erro -->
    <AlertMessage
      v-if="showErrorAlert"
      type="error"
      title="Erro ao Registrar Venda"
      :message="errorMessage"
      :auto-hide="true"
      @dismiss="showErrorAlert = false"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { formatters } from '@/utils/formatters'
import { VENDA_ORIGENS, FORMAS_PAGAMENTO_VENDA, FORMA_PAGAMENTO_TO_FINALIDADE } from '@/utils/constants'
import { useVendasStore } from '@/stores/vendas'
import contaBancariaService from '@/services/contaBancariaService'
import type { ContaBancaria } from '@/types/financeiro'

const vendasStore = useVendasStore()

const forma = reactive({
  descricao: '',
  valor: '',
  origem: '' as 'CANTINA' | 'BAZAR' | 'LIVROS' | '',
  formaPagamento: '' as 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO' | '',
  contaBancariaId: '' as string,
})

const errors = reactive({
  descricao: '',
  valor: '',
  origem: '',
  formaPagamento: '',
  contaBancaria: '',
})

// US-067: Contas bancárias disponíveis
const contasDisponiveis = ref<ContaBancaria[]>([])
const carregandoContas = ref(false)

const isSubmitting = ref(false)
const showSuccessAlert = ref(false)
const errorMessage = ref('')
const showErrorAlert = ref(false)

// US-067: Mensagem informativa sobre seleção automática de conta
const mensagemContaAutomatica = computed(() => {
  if (!forma.formaPagamento) return ''
  if (forma.contaBancariaId) return ''
  if (contasDisponiveis.value.length === 0) {
    return '⚠️ Nenhuma conta configurada para esta forma de pagamento'
  }
  return '✓ Conta será selecionada automaticamente'
})

// US-067: Observa mudanças na forma de pagamento para buscar contas
watch(() => forma.formaPagamento, async (novaForma) => {
  if (!novaForma) {
    contasDisponiveis.value = []
    forma.contaBancariaId = ''
    return
  }

  await carregarContasPorFormaPagamento(novaForma)
})

// US-067: Carrega contas disponíveis para a forma de pagamento
async function carregarContasPorFormaPagamento(formaPagamento: string) {
  try {
    carregandoContas.value = true
    errors.contaBancaria = ''

    // Mapear forma de pagamento para finalidade
    const finalidade = FORMA_PAGAMENTO_TO_FINALIDADE[formaPagamento as keyof typeof FORMA_PAGAMENTO_TO_FINALIDADE]

    if (!finalidade) {
      contasDisponiveis.value = []
      return
    }

    // Buscar contas ativas com a finalidade
    const contas = await contaBancariaService.findByFinalidade(finalidade)
    contasDisponiveis.value = contas

    // Se houver apenas uma conta, selecionar automaticamente
    if (contas.length === 1) {
      forma.contaBancariaId = contas[0].id || ''
    }

  } catch (error) {
    console.error('Erro ao carregar contas:', error)
    contasDisponiveis.value = []
  } finally {
    carregandoContas.value = false
  }
}

function validateForm(): boolean {
  // Reset errors
  errors.descricao = ''
  errors.valor = ''
  errors.origem = ''
  errors.formaPagamento = ''
  errors.contaBancaria = ''

  let isValid = true

  if (!forma.descricao || forma.descricao.trim() === '') {
    errors.descricao = 'Descrição é obrigatória'
    isValid = false
  }

  if (!forma.valor || parseFloat(forma.valor) <= 0) {
    errors.valor = 'Digite um valor válido'
    isValid = false
  }

  if (!forma.origem) {
    errors.origem = 'Selecione a origem da venda'
    isValid = false
  }

  if (!forma.formaPagamento) {
    errors.formaPagamento = 'Selecione a forma de pagamento'
    isValid = false
  }

  // US-067: Validar se há conta disponível (mesmo que seja seleção automática)
  if (contasDisponiveis.value.length === 0 && !forma.contaBancariaId) {
    errors.contaBancaria = 'Configure uma conta bancária para esta forma de pagamento'
    isValid = false
  }

  return isValid
}

async function registrarVenda() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    errorMessage.value = ''
    showErrorAlert.value = false

    // US-067: Incluir contaBancariaId se selecionada manualmente
    const vendaData: any = {
      descricao: forma.descricao,
      valor: parseFloat(forma.valor),
      origem: forma.origem as 'CANTINA' | 'BAZAR' | 'LIVROS',
      formaPagamento: forma.formaPagamento as 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'DINHEIRO',
    }

    if (forma.contaBancariaId) {
      vendaData.contaBancariaId = forma.contaBancariaId
    }

    await vendasStore.criarVenda(vendaData)

    // Reset form
    forma.descricao = ''
    forma.valor = ''
    forma.origem = ''
    forma.formaPagamento = ''
    forma.contaBancariaId = ''
    contasDisponiveis.value = []

    // Mostrar sucesso
    showSuccessAlert.value = true

  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    errorMessage.value = 'Erro ao registrar venda. Tente novamente.'
    showErrorAlert.value = true
  } finally {
    isSubmitting.value = false
  }
}

function getOrigemLabel(origem: string): string {
  const item = VENDA_ORIGENS.find(o => o.value === origem)
  return item?.label || origem
}

// US-067: Obter label da forma de pagamento
function getFormaPagamentoLabel(formaPagamento: string): string {
  const item = FORMAS_PAGAMENTO_VENDA.find(f => f.value === formaPagamento)
  return item?.icon + ' ' + item?.label || formaPagamento
}

onMounted(async () => {
  try {
    await vendasStore.carregarVendasRecentes()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})
</script>
