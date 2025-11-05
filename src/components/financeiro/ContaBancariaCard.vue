<template>
  <div
    class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ conta.nome }}
          </h3>
          <span
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="statusClass"
          >
            {{ StatusContaLabel[conta.status] }}
          </span>
        </div>

        <div class="space-y-1 text-sm text-gray-600">
          <p>
            <span class="font-medium">Tipo:</span>
            {{ TipoContaLabel[conta.tipo] }}
          </p>
          <p>
            <span class="font-medium">Finalidade:</span>
            {{ FinalidadeContaLabel[conta.finalidade] }}
          </p>

          <div v-if="conta.tipo === TipoConta.BANCARIA && conta.banco" class="mt-2 pt-2 border-t border-gray-200">
            <p><span class="font-medium">Banco:</span> {{ conta.banco }}</p>
            <p v-if="conta.agencia">
              <span class="font-medium">Agência:</span> {{ conta.agencia }}
            </p>
            <p v-if="conta.numeroConta">
              <span class="font-medium">Conta:</span> {{ conta.numeroConta }}
            </p>
          </div>
        </div>
      </div>

      <div class="text-right ml-4">
        <p class="text-sm text-gray-500 mb-1">Saldo Atual</p>
        <p class="text-2xl font-bold" :class="saldoClass">
          {{ formatCurrency(conta.saldoAtual) }}
        </p>
        <p class="text-xs text-gray-500 mt-1">
          Inicial: {{ formatCurrency(conta.saldoInicial) }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <BaseButton
        variant="outline"
        size="sm"
        @click.stop="$emit('edit')"
      >
        Editar
      </BaseButton>

      <BaseButton
        v-if="conta.status === StatusConta.ATIVA"
        variant="danger"
        size="sm"
        @click.stop="$emit('inativar')"
      >
        Inativar
      </BaseButton>

      <BaseButton
        variant="primary"
        size="sm"
        @click.stop="$emit('ver-extrato')"
      >
        Ver Extrato
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatCurrency } from '@/utils/formatters'
import {
  TipoConta,
  StatusConta,
  TipoContaLabel,
  FinalidadeContaLabel,
  StatusContaLabel,
  type ContaBancaria
} from '@/types/financeiro'

interface Props {
  conta: ContaBancaria
}

const props = defineProps<Props>()

defineEmits<{
  click: []
  edit: []
  inativar: []
  'ver-extrato': []
}>()

const statusClass = computed(() => {
  return props.conta.status === StatusConta.ATIVA
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800'
})

const saldoClass = computed(() => {
  if (props.conta.saldoAtual < 0) return 'text-red-600'
  if (props.conta.saldoAtual === 0) return 'text-gray-600'
  return 'text-green-600'
})
</script>
