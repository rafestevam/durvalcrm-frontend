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
                  @click="forma.origem = origem.value"
                >
                  {{ origem.label }}
                </button>
              </div>
              <p v-if="errors.origem" class="form-error">{{ errors.origem }}</p>
            </div>


            <!-- Opções de Pagamento -->
            <div>
              <label class="form-label">Opções de Pagamento</label>
              <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex items-center justify-center px-6 py-4 border-2 rounded-lg text-lg font-medium transition-colors"
                  :class="[
                    forma.formaPagamento === 'PIX'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  ]"
                  @click="forma.formaPagamento = 'PIX'"
                >
                  PIX
                </button>
                <button
                  type="button"
                  class="flex items-center justify-center px-6 py-4 border-2 rounded-lg text-lg font-medium transition-colors"
                  :class="[
                    forma.formaPagamento === 'DINHEIRO'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  ]"
                  @click="forma.formaPagamento = 'DINHEIRO'"
                >
                  Dinheiro
                </button>
              </div>
              <p v-if="errors.formaPagamento" class="form-error">{{ errors.formaPagamento }}</p>
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
                  {{ getOrigemLabel(venda.origem) }}
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
import { ref, reactive, onMounted } from 'vue'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { formatters } from '@/utils/formatters'
import { VENDA_ORIGENS } from '@/utils/constants'
import { useVendasStore } from '@/stores/vendas'
// import type { Venda } from '@/services/types' // Unused import

const vendasStore = useVendasStore()

const forma = reactive({
  descricao: '',
  valor: '',
  origem: '' as 'CANTINA' | 'BAZAR' | 'LIVROS' | '',
  formaPagamento: '' as 'PIX' | 'DINHEIRO' | '',
})

const errors = reactive({
  descricao: '',
  valor: '',
  origem: '',
  formaPagamento: '',
})

const isSubmitting = ref(false)
const showSuccessAlert = ref(false)
const errorMessage = ref('')
const showErrorAlert = ref(false)

function validateForm(): boolean {
  // Reset errors
  errors.descricao = ''
  errors.valor = ''
  errors.origem = ''
  errors.formaPagamento = ''

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

  return isValid
}

async function registrarVenda() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true
    errorMessage.value = ''
    showErrorAlert.value = false

    await vendasStore.criarVenda({
      descricao: forma.descricao,
      valor: parseFloat(forma.valor),
      origem: forma.origem as 'CANTINA' | 'BAZAR' | 'LIVROS',
      formaPagamento: forma.formaPagamento as 'PIX' | 'DINHEIRO',
    })

    // Reset form
    forma.descricao = ''
    forma.valor = ''
    forma.origem = ''
    forma.formaPagamento = ''

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

onMounted(async () => {
  try {
    await vendasStore.carregarVendasRecentes()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
  }
})
</script>
