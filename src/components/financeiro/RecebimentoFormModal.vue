<template>
  <BaseModal
    :show="show"
    :title="'Novo Recebimento'"
    size="lg"
    @close="close"
    @update:show="$emit('update:show', $event)"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Data e Valor -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput
          v-model="form.dataRecebimento"
          type="date"
          label="Data do Recebimento"
          required
          :max="maxDate"
          :error="errors.dataRecebimento"
          @blur="validateField('dataRecebimento')"
        />

        <BaseInput
          v-model="form.valor"
          type="number"
          step="0.01"
          min="0.01"
          label="Valor"
          placeholder="0,00"
          required
          :error="errors.valor"
          @blur="validateField('valor')"
        />
      </div>

      <!-- Forma de Pagamento e Origem -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseSelect
          v-model="form.formaPagamento"
          label="Forma de Pagamento"
          required
          :error="errors.formaPagamento"
          @change="onFormaPagamentoChange"
        >
          <option value="">Selecione...</option>
          <option
            v-for="(label, value) in FormaPagamentoRecebimentoLabel"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </BaseSelect>

        <BaseSelect
          v-model="form.origem"
          label="Origem do Recebimento"
          required
          :error="errors.origem"
        >
          <option value="">Selecione...</option>
          <option
            v-for="(label, value) in OrigemRecebimentoLabel"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </BaseSelect>
      </div>

      <!-- Conta de Destino -->
      <BaseSelect
        v-model="form.contaBancariaId"
        label="Conta de Destino"
        required
        :error="errors.contaBancariaId"
        @blur="validateField('contaBancariaId')"
      >
        <option value="">Selecione...</option>
        <option
          v-for="conta in contasAtivas"
          :key="conta.id"
          :value="conta.id"
        >
          {{ conta.nome }} - {{ FinalidadeContaLabel[conta.finalidade] }}
          ({{ formatCurrency(conta.saldoAtual) }})
        </option>
      </BaseSelect>

      <!-- Alerta de finalidade incompatível -->
      <div
        v-if="showFinalidadeAlert"
        class="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800"
      >
        ⚠️ A forma de pagamento não corresponde à finalidade da conta selecionada
      </div>

      <!-- Descrição -->
      <BaseInput
        v-model="form.descricao"
        label="Descrição"
        placeholder="Ex: Mensalidade de João Silva"
        :error="errors.descricao"
      />

      <!-- Observações -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">
          Observações
        </label>
        <textarea
          v-model="form.observacoes"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Informações adicionais (opcional)"
        ></textarea>
      </div>
    </form>

    <template #footer>
      <div class="flex space-x-3">
        <BaseButton
          variant="outline"
          @click="close"
        >
          Cancelar
        </BaseButton>

        <BaseButton
          variant="primary"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          Registrar Recebimento
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRecebimentoStore } from '@/stores/recebimento'
import { useContaBancariaStore } from '@/stores/contaBancaria'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import {
  FormaPagamentoRecebimento,
  FinalidadeConta,
  FormaPagamentoRecebimentoLabel,
  OrigemRecebimentoLabel,
  FinalidadeContaLabel
} from '@/types/financeiro'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: []
  close: []
}>()

const recebimentoStore = useRecebimentoStore()
const contaBancariaStore = useContaBancariaStore()

const form = reactive({
  dataRecebimento: '',
  valor: '' as string,
  formaPagamento: '' as any,
  origem: '' as any,
  contaBancariaId: '',
  descricao: '',
  observacoes: '',
})

const errors = reactive({
  dataRecebimento: '',
  valor: '',
  formaPagamento: '',
  origem: '',
  contaBancariaId: '',
  descricao: '',
})

const isSubmitting = ref(false)

// Get today's date in YYYY-MM-DD format
const maxDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const contasAtivas = computed(() => contaBancariaStore.contasAtivas)

// Auto-select conta based on forma de pagamento
const suggestedContaId = computed(() => {
  if (!form.formaPagamento) return null

  const formaPagamentoToFinalidade: Record<FormaPagamentoRecebimento, FinalidadeConta> = {
    [FormaPagamentoRecebimento.PIX]: FinalidadeConta.PIX,
    [FormaPagamentoRecebimento.CARTAO_CREDITO]: FinalidadeConta.CARTAO_CREDITO,
    [FormaPagamentoRecebimento.CARTAO_DEBITO]: FinalidadeConta.CARTAO_DEBITO,
    [FormaPagamentoRecebimento.DINHEIRO]: FinalidadeConta.DINHEIRO_DEPOSITOS,
  }

  const finalidade = formaPagamentoToFinalidade[form.formaPagamento as FormaPagamentoRecebimento]
  const conta = contasAtivas.value.find(c => c.finalidade === finalidade)

  return conta?.id || null
})

// Alert if selected conta doesn't match forma de pagamento
const showFinalidadeAlert = computed(() => {
  if (!form.contaBancariaId || !form.formaPagamento) return false

  const conta = contasAtivas.value.find(c => c.id === form.contaBancariaId)
  if (!conta) return false

  const formaPagamentoToFinalidade: Record<FormaPagamentoRecebimento, FinalidadeConta[]> = {
    [FormaPagamentoRecebimento.PIX]: [FinalidadeConta.PIX],
    [FormaPagamentoRecebimento.CARTAO_CREDITO]: [FinalidadeConta.CARTAO_CREDITO],
    [FormaPagamentoRecebimento.CARTAO_DEBITO]: [FinalidadeConta.CARTAO_DEBITO],
    [FormaPagamentoRecebimento.DINHEIRO]: [FinalidadeConta.DINHEIRO_DEPOSITOS, FinalidadeConta.OPERACIONAL],
  }

  const validFinalidades = formaPagamentoToFinalidade[form.formaPagamento as FormaPagamentoRecebimento]
  return !validFinalidades.includes(conta.finalidade)
})

function onFormaPagamentoChange() {
  // Auto-select conta if not set
  if (!form.contaBancariaId && suggestedContaId.value) {
    form.contaBancariaId = suggestedContaId.value
  }
}

function resetForm() {
  form.dataRecebimento = maxDate.value
  form.valor = ''
  form.formaPagamento = ''
  form.origem = ''
  form.contaBancariaId = ''
  form.descricao = ''
  form.observacoes = ''

  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

function validateField(field: keyof typeof form): boolean {
  switch (field) {
    case 'dataRecebimento':
      if (!form.dataRecebimento) {
        errors.dataRecebimento = 'Data é obrigatória'
        return false
      }
      if (form.dataRecebimento > maxDate.value) {
        errors.dataRecebimento = 'Data não pode ser futura'
        return false
      }
      errors.dataRecebimento = ''
      return true

    case 'valor':
      const valor = typeof form.valor === 'string'
        ? parseFloat(form.valor)
        : form.valor

      if (isNaN(valor) || valor <= 0) {
        errors.valor = 'Valor deve ser maior que zero'
        return false
      }
      errors.valor = ''
      return true

    case 'formaPagamento':
      if (!form.formaPagamento) {
        errors.formaPagamento = 'Forma de pagamento é obrigatória'
        return false
      }
      errors.formaPagamento = ''
      return true

    case 'origem':
      if (!form.origem) {
        errors.origem = 'Origem é obrigatória'
        return false
      }
      errors.origem = ''
      return true

    case 'contaBancariaId':
      if (!form.contaBancariaId) {
        errors.contaBancariaId = 'Conta de destino é obrigatória'
        return false
      }
      errors.contaBancariaId = ''
      return true

    default:
      return true
  }
}

function validateForm(): boolean {
  const fields = ['dataRecebimento', 'valor', 'formaPagamento', 'origem', 'contaBancariaId'] as const
  return fields.every(field => validateField(field))
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const recebimentoData = {
      dataRecebimento: form.dataRecebimento,
      valor: typeof form.valor === 'string' ? parseFloat(form.valor) : form.valor,
      formaPagamento: form.formaPagamento,
      origem: form.origem,
      contaBancariaId: form.contaBancariaId,
      descricao: form.descricao.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined,
    }

    await recebimentoStore.createRecebimento(recebimentoData)

    // Refresh conta to update balance
    await contaBancariaStore.fetchContas()

    emit('saved')
    close()
  } catch (error: any) {
    console.error('Erro ao registrar recebimento:', error)

    if (error.response?.data?.message) {
      alert(error.response.data.message)
    } else {
      alert('Erro ao registrar recebimento. Tente novamente.')
    }
  } finally {
    isSubmitting.value = false
  }
}

function close() {
  resetForm()
  emit('close')
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm()
    // Load contas if not loaded
    if (contasAtivas.value.length === 0) {
      contaBancariaStore.fetchContas()
    }
  }
})
</script>
