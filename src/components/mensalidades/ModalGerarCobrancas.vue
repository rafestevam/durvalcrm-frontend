<template>
  <BaseModal :show="show" @close="$emit('close')" size="md">
    <template #title>
      Gerar Cobranças
    </template>
    
    <template #default>
      <div class="space-y-4">
        <div class="bg-amber-50 border border-amber-200 rounded-md p-4">
          <div class="flex">
            <ExclamationTriangleIcon class="h-5 w-5 text-amber-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-amber-800">
                Confirmar Geração de Cobranças
              </h3>
              <div class="mt-2 text-sm text-amber-700">
                <p>
                  Será gerada uma cobrança de <strong>{{ formatters.money(10.90) }}</strong> 
                  para cada associado ativo no período <strong>{{ periodoFormatado }}</strong>.
                </p>
                <p class="mt-2">
                  Cobranças duplicadas não serão criadas. O sistema verificará automaticamente 
                  se já existem cobranças para este período.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumo -->
        <div v-if="resumo" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-2">Resumo Atual:</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Total de Associados:</span>
              <span class="font-medium ml-2">{{ resumo.totalAssociados }}</span>
            </div>
            <div>
              <span class="text-gray-600">Já Possuem Cobrança:</span>
              <span class="font-medium ml-2">{{ jaTemCobranca }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          id="mensalidades-modal-gerar-cancelar"
          type="button"
          class="btn btn-outline px-4 py-2 text-sm"
          @click="$emit('close')"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          id="mensalidades-modal-gerar-confirmar"
          type="button"
          class="btn btn-primary px-4 py-2 text-sm"
          @click="confirmarGeracao"
          :disabled="loading"
        >
          <span v-if="loading">Gerando...</span>
          <span v-else>Gerar Cobranças</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import BaseModal from '@/components/common/BaseModal.vue'
import { formatters } from '@/utils/formatters'
import type { ResumoMensalidades } from '@/services/types'

interface Props {
  show: boolean
  periodo: { mes: number; ano: number }
  resumo: ResumoMensalidades | null
  loading: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'confirmar'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const periodoFormatado = computed(() => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return `${meses[props.periodo.mes - 1]} ${props.periodo.ano}`
})

// Calcula quantos associados já têm cobrança gerada
const jaTemCobranca = computed(() => {
  if (!props.resumo) return 0
  
  // Se há mensalidades pagas, pendentes ou atrasadas, significa que já foram geradas
  // Baseado no DTO do backend: totalPagas, totalPendentes, totalAtrasadas
  return (props.resumo.totalPagas || 0) + (props.resumo.totalPendentes || 0) + (props.resumo.totalAtrasadas || 0)
})

function confirmarGeracao() {
  emit('confirmar')
}
</script>