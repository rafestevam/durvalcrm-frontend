<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Editar Conta' : 'Nova Conta Bancária/Caixa'"
    size="lg"
    @close="close"
    @update:show="$emit('update:show', $event)"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Nome da Conta -->
      <BaseInput
        v-model="form.nome"
        label="Nome da Conta"
        placeholder="Ex: Caixa Físico Principal, Conta PIX Banco do Brasil"
        required
        :error="errors.nome"
        @blur="validateField('nome')"
      />

      <!-- Tipo e Finalidade -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseSelect
          v-model="form.tipo"
          label="Tipo"
          required
          :error="errors.tipo"
          @change="onTipoChange"
        >
          <option value="">Selecione...</option>
          <option v-for="(label, value) in TipoContaLabel" :key="value" :value="value">
            {{ label }}
          </option>
        </BaseSelect>

        <BaseSelect
          v-model="form.finalidade"
          label="Finalidade"
          required
          :error="errors.finalidade"
        >
          <option value="">Selecione...</option>
          <option v-for="(label, value) in FinalidadeContaLabel" :key="value" :value="value">
            {{ label }}
          </option>
        </BaseSelect>
      </div>

      <!-- Dados Bancários (apenas para contas bancárias) -->
      <div v-if="form.tipo === TipoConta.BANCARIA" class="space-y-4">
        <BaseInput
          v-model="form.banco"
          label="Banco"
          placeholder="Ex: Banco do Brasil, Caixa Econômica"
          :error="errors.banco"
        />

        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model="form.agencia"
            label="Agência"
            placeholder="Ex: 1234-5"
            :error="errors.agencia"
          />

          <BaseInput
            v-model="form.numeroConta"
            label="Número da Conta"
            placeholder="Ex: 56789-0"
            :error="errors.numeroConta"
          />
        </div>
      </div>

      <!-- Saldo Inicial -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput
          v-model="form.saldoInicial"
          type="number"
          step="0.01"
          min="0"
          label="Saldo Inicial"
          placeholder="0,00"
          required
          :error="errors.saldoInicial"
          @blur="validateField('saldoInicial')"
        />

        <BaseInput
          v-model="form.dataSaldoInicial"
          type="date"
          label="Data do Saldo Inicial"
          required
          :error="errors.dataSaldoInicial"
          @blur="validateField('dataSaldoInicial')"
        />
      </div>

      <div v-if="isEditing" class="text-sm text-gray-600">
        <p><strong>Saldo Atual:</strong> {{ formatCurrency(contaAtual?.saldoAtual || 0) }}</p>
        <p class="text-xs text-gray-500 mt-1">
          * O saldo é atualizado automaticamente pelos recebimentos
        </p>
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
          {{ isEditing ? 'Atualizar' : 'Salvar' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useContaBancariaStore } from '@/stores/contaBancaria'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import {
  TipoConta,
  FinalidadeConta,
  TipoContaLabel,
  FinalidadeContaLabel,
  type ContaBancaria
} from '@/types/financeiro'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  show: boolean
  conta?: ContaBancaria | null
}

const props = withDefaults(defineProps<Props>(), {
  conta: null,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: []
  close: []
}>()

const contaBancariaStore = useContaBancariaStore()

const form = reactive({
  nome: '',
  tipo: '' as any,
  finalidade: '' as any,
  banco: '',
  agencia: '',
  numeroConta: '',
  saldoInicial: '' as string,
  dataSaldoInicial: '',
})

const errors = reactive({
  nome: '',
  tipo: '',
  finalidade: '',
  banco: '',
  agencia: '',
  numeroConta: '',
  saldoInicial: '',
  dataSaldoInicial: '',
})

const isSubmitting = ref(false)
const contaAtual = ref<ContaBancaria | null>(null)

const isEditing = computed(() => !!props.conta?.id)

function resetForm() {
  form.nome = ''
  form.tipo = ''
  form.finalidade = ''
  form.banco = ''
  form.agencia = ''
  form.numeroConta = ''
  form.saldoInicial = ''
  form.dataSaldoInicial = ''

  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  contaAtual.value = null
}

function populateForm() {
  if (props.conta) {
    contaAtual.value = props.conta
    form.nome = props.conta.nome
    form.tipo = props.conta.tipo
    form.finalidade = props.conta.finalidade
    form.banco = props.conta.banco || ''
    form.agencia = props.conta.agencia || ''
    form.numeroConta = props.conta.numeroConta || ''
    form.saldoInicial = props.conta.saldoInicial.toString()
    form.dataSaldoInicial = typeof props.conta.dataSaldoInicial === 'string'
      ? props.conta.dataSaldoInicial
      : ''
  }
}

function onTipoChange() {
  // Clear bank data when switching to CAIXA_FISICO
  if (form.tipo === TipoConta.CAIXA_FISICO) {
    form.banco = ''
    form.agencia = ''
    form.numeroConta = ''
  }
}

function validateField(field: keyof typeof form): boolean {
  switch (field) {
    case 'nome':
      if (!form.nome.trim()) {
        errors.nome = 'Nome é obrigatório'
        return false
      }
      errors.nome = ''
      return true

    case 'tipo':
      if (!form.tipo) {
        errors.tipo = 'Tipo é obrigatório'
        return false
      }
      errors.tipo = ''
      return true

    case 'finalidade':
      if (!form.finalidade) {
        errors.finalidade = 'Finalidade é obrigatória'
        return false
      }
      errors.finalidade = ''
      return true

    case 'saldoInicial':
      const saldo = typeof form.saldoInicial === 'string'
        ? parseFloat(form.saldoInicial)
        : form.saldoInicial

      if (isNaN(saldo) || saldo < 0) {
        errors.saldoInicial = 'Saldo inicial inválido'
        return false
      }
      errors.saldoInicial = ''
      return true

    case 'dataSaldoInicial':
      if (!form.dataSaldoInicial) {
        errors.dataSaldoInicial = 'Data do saldo inicial é obrigatória'
        return false
      }
      errors.dataSaldoInicial = ''
      return true

    default:
      return true
  }
}

function validateForm(): boolean {
  const fields = ['nome', 'tipo', 'finalidade', 'saldoInicial', 'dataSaldoInicial'] as const
  return fields.every(field => validateField(field))
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const contaData = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      finalidade: form.finalidade,
      banco: form.banco.trim() || undefined,
      agencia: form.agencia.trim() || undefined,
      numeroConta: form.numeroConta.trim() || undefined,
      saldoInicial: typeof form.saldoInicial === 'string'
        ? parseFloat(form.saldoInicial)
        : form.saldoInicial,
      dataSaldoInicial: form.dataSaldoInicial,
    }

    if (isEditing.value) {
      await contaBancariaStore.updateConta(props.conta!.id!, contaData)
    } else {
      await contaBancariaStore.createConta(contaData)
    }

    emit('saved')
    close()
  } catch (error: any) {
    console.error('Erro ao salvar conta:', error)

    if (error.response?.status === 400) {
      const message = error.response.data.message || error.message
      if (message.includes('nome')) {
        errors.nome = 'Já existe uma conta com este nome'
      } else {
        alert(message)
      }
    } else {
      alert('Erro ao salvar conta. Tente novamente.')
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
    if (props.conta) {
      populateForm()
    } else {
      resetForm()
    }
  }
})
</script>
