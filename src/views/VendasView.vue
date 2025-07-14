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
          
          <div v-if="vendasRecentes.length === 0" class="text-center py-4">
            <ShoppingCartIcon class="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p class="text-gray-600">Nenhuma venda registrada hoje</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="venda in vendasRecentes"
              :key="venda.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium">{{ getOrigemLabel(venda.origem) }}</p>
                <p class="text-sm text-gray-600">{{ formatters.datetime(venda.dataVenda) }}</p>
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
import type { Venda } from '@/services/types'

const forma = reactive({
  valor: '',
  origem: '' as 'CANTINA' | 'BAZAR' | 'LIVROS' | '',
})

const errors = reactive({
  valor: '',
  origem: '',
})

const isSubmitting = ref(false)
const showSuccessAlert = ref(false)
const vendasRecentes = ref<Venda[]>([])

function validateForm(): boolean {
  // Reset errors
  errors.valor = ''
  errors.origem = ''

  let isValid = true

  if (!forma.valor || parseFloat(forma.valor) <= 0) {
    errors.valor = 'Digite um valor válido'
    isValid = false
  }

  if (!forma.origem) {
    errors.origem = 'Selecione a origem da venda'
    isValid = false
  }

  return isValid
}

async function registrarVenda() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    // Simular chamada da API
    const novaVenda: Venda = {
      id: Date.now().toString(),
      valor: parseFloat(forma.valor),
      origem: forma.origem as 'CANTINA' | 'BAZAR' | 'LIVROS',
      dataVenda: new Date().toISOString(),
    }

    // Adicionar à lista de vendas recentes
    vendasRecentes.value.unshift(novaVenda)

    // Reset form
    forma.valor = ''
    forma.origem = ''

    // Mostrar sucesso
    showSuccessAlert.value = true

    console.log('Venda registrada:', novaVenda)
  } catch (error) {
    console.error('Erro ao registrar venda:', error)
    alert('Erro ao registrar venda')
  } finally {
    isSubmitting.value = false
  }
}

function getOrigemLabel(origem: string): string {
  const item = VENDA_ORIGENS.find(o => o.value === origem)
  return item?.label || origem
}

onMounted(() => {
  // Carregar vendas recentes do dia
  // Por enquanto, dados mockados
  vendasRecentes.value = []
})
</script>
