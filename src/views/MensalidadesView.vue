<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Cabeçalho -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestão de Mensalidades</h1>
        </div>
      </div>

      <!-- Controles -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <div class="sm:flex sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">
                Exibindo dados de:
              </label>
              <select
                v-model="selectedPeriod"
                class="form-input w-48"
                @change="onPeriodChange"
              >
                <option v-for="periodo in periodos" :key="periodo.value" :value="periodo.value">
                  {{ periodo.label }}
                </option>
              </select>
            </div>
            
            <div class="flex space-x-3">
              <BaseButton variant="primary" @click="gerarCobrancas">
                Gerar Cobranças
              </BaseButton>
              <BaseButton variant="primary" @click="enviarEmails">
                Enviar E-mails
              </BaseButton>
              <BaseButton variant="success" @click="reconciliar">
                Reconciliar
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela de Mensalidades -->
      <div class="bg-white shadow rounded-lg">
        <div v-if="isLoading" class="p-8 text-center">
          <LoadingSpinner class="w-8 h-8 mx-auto mb-4" />
          <p class="text-gray-600">Carregando mensalidades...</p>
        </div>

        <div v-else-if="mensalidades.length === 0" class="p-8 text-center">
          <CreditCardIcon class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">Nenhuma mensalidade encontrada para este período</p>
        </div>

        <div v-else class="overflow-hidden">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Associado</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data do Pagamento</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="mensalidade in mensalidades" :key="mensalidade.id">
                <td class="font-medium">
                  {{ mensalidade.associado?.nomeCompleto || 'N/A' }}
                </td>
                <td>{{ formatters.currency(mensalidade.valor) }}</td>
                <td>
                  <span
                    class="status-badge"
                    :class="MENSALIDADE_STATUS_COLORS[mensalidade.status]"
                  >
                    {{ MENSALIDADE_STATUS[mensalidade.status] }}
                  </span>
                </td>
                <td>
                  {{ mensalidade.dataPagamento ? formatters.date(mensalidade.dataPagamento) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CreditCardIcon } from '@heroicons/vue/24/outline'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { formatters } from '@/utils/formatters'
import { MENSALIDADE_STATUS, MENSALIDADE_STATUS_COLORS, MESES } from '@/utils/constants'
import type { Mensalidade } from '@/services/types'

const mensalidades = ref<Mensalidade[]>([])
const isLoading = ref(false)
const selectedPeriod = ref(`${new Date().getFullYear()}-${new Date().getMonth() + 1}`)

const periodos = computed(() => {
  const currentYear = new Date().getFullYear()
  const periods = []
  
  for (let year = currentYear; year >= currentYear - 2; year--) {
    for (const mes of MESES) {
      periods.push({
        value: `${year}-${mes.value}`,
        label: `${mes.label} / ${year}`
      })
    }
  }
  
  return periods
})

async function loadMensalidades() {
  try {
    isLoading.value = true
    // Simular dados de mensalidades
    const mockData: Mensalidade[] = [
      {
        id: '1',
        associadoId: '1',
        associado: { id: '1', nomeCompleto: 'Ana da Silva', cpf: '111.222.333-44', email: 'ana@email.com' },
        mesReferencia: 7,
        anoReferencia: 2025,
        valor: 10.90,
        status: 'PAGA',
        dataVencimento: '2025-07-10',
        dataPagamento: '2025-07-05'
      },
      {
        id: '2',
        associadoId: '2',
        associado: { id: '2', nomeCompleto: 'Bruno Costa', cpf: '222.333.444-55', email: 'bruno@email.com' },
        mesReferencia: 7,
        anoReferencia: 2025,
        valor: 10.90,
        status: 'PENDENTE',
        dataVencimento: '2025-07-10'
      }
    ]
    
    mensalidades.value = mockData
  } catch (error) {
    console.error('Erro ao carregar mensalidades:', error)
  } finally {
    isLoading.value = false
  }
}

function onPeriodChange() {
  loadMensalidades()
}

function gerarCobrancas() {
  alert('Funcionalidade de gerar cobranças será implementada')
}

function enviarEmails() {
  alert('Funcionalidade de envio de e-mails será implementada')
}

function reconciliar() {
  alert('Funcionalidade de reconciliação será implementada')
}

onMounted(() => {
  loadMensalidades()
})
</script>
