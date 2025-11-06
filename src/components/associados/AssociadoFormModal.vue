<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Editar Associado' : 'Adicionar Novo Associado'"
    size="lg"
    @close="close"
    @update:show="$emit('update:show', $event)"
  >
    <form @submit.prevent="handleSubmit" class="space-y-6" id="associado-form">
      <div>
        <label for="associado-nome-completo" class="form-label">
          Nome Completo
          <span class="text-danger-500 ml-1">*</span>
        </label>
        <input
          id="associado-nome-completo"
          v-model="form.nomeCompleto"
          type="text"
          required
          class="form-input"
          :class="{ 'border-danger-300': errors.nomeCompleto }"
          @blur="validateField('nomeCompleto')"
        />
        <p v-if="errors.nomeCompleto" class="form-error">{{ errors.nomeCompleto }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label for="associado-cpf" class="form-label">
            CPF
            <span class="text-danger-500 ml-1">*</span>
          </label>
          <input
            id="associado-cpf"
            v-model="form.cpf"
            type="text"
            placeholder="000.000.000-00"
            required
            class="form-input"
            :class="{ 'border-danger-300': errors.cpf }"
            @input="onCpfInput"
            @blur="validateField('cpf')"
          />
          <p v-if="errors.cpf" class="form-error">{{ errors.cpf }}</p>
        </div>

        <div>
          <label for="associado-telefone" class="form-label">Telefone</label>
          <input
            id="associado-telefone"
            v-model="form.telefone"
            type="text"
            placeholder="(00) 00000-0000"
            class="form-input"
            :class="{ 'border-danger-300': errors.telefone }"
            @input="onTelefoneInput"
            @blur="validateField('telefone')"
          />
          <p v-if="errors.telefone" class="form-error">{{ errors.telefone }}</p>
        </div>
      </div>

      <div>
        <label for="associado-email" class="form-label">
          E-mail
          <span class="text-danger-500 ml-1">*</span>
        </label>
        <input
          id="associado-email"
          v-model="form.email"
          type="email"
          required
          class="form-input"
          :class="{ 'border-danger-300': errors.email }"
          @blur="validateField('email')"
        />
        <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
      </div>
    </form>

    <template #footer>
      <div class="flex space-x-3">
        <button
          id="associado-form-cancelar"
          type="button"
          class="btn btn-outline px-4 py-2 text-sm"
          @click="close"
        >
          Cancelar
        </button>

        <button
          id="associado-form-salvar"
          type="button"
          class="btn btn-primary px-4 py-2 text-sm"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting">Salvando...</span>
          <span v-else>{{ isEditing ? 'Atualizar' : 'Salvar' }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useAssociadosStore } from '@/stores/associados'
import BaseModal from '@/components/common/BaseModal.vue'
import { validators, validationMessages } from '@/utils/validators'
import { formatters } from '@/utils/formatters'
import type { Associado } from '@/services/types'

interface Props {
  show: boolean
  associado?: Associado | null
}

const props = withDefaults(defineProps<Props>(), {
  associado: null,
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  saved: []
  close: []
}>()

const associadosStore = useAssociadosStore()

const form = reactive({
  nomeCompleto: '',
  cpf: '',
  email: '',
  telefone: '',
})

const errors = reactive({
  nomeCompleto: '',
  cpf: '',
  email: '',
  telefone: '',
})

const isSubmitting = ref(false)

const isEditing = computed(() => !!props.associado?.id)

function resetForm() {
  form.nomeCompleto = ''
  form.cpf = ''
  form.email = ''
  form.telefone = ''
  
  errors.nomeCompleto = ''
  errors.cpf = ''
  errors.email = ''
  errors.telefone = ''
}

function populateForm() {
  if (props.associado) {
    form.nomeCompleto = props.associado.nomeCompleto
    form.cpf = props.associado.cpf
    form.email = props.associado.email
    form.telefone = props.associado.telefone || ''
  }
}

function validateField(field: keyof typeof form): boolean {
  switch (field) {
    case 'nomeCompleto':
      if (!validators.required(form.nomeCompleto)) {
        errors.nomeCompleto = validationMessages.required
        return false
      }
      if (!validators.minLength(2)(form.nomeCompleto)) {
        errors.nomeCompleto = validationMessages.minLength(2)
        return false
      }
      errors.nomeCompleto = ''
      return true

    case 'cpf':
      if (!validators.required(form.cpf)) {
        errors.cpf = validationMessages.required
        return false
      }
      if (!validators.cpf(form.cpf)) {
        errors.cpf = validationMessages.cpf
        return false
      }
      errors.cpf = ''
      return true

    case 'email':
      if (!validators.required(form.email)) {
        errors.email = validationMessages.required
        return false
      }
      if (!validators.email(form.email)) {
        errors.email = validationMessages.email
        return false
      }
      errors.email = ''
      return true

    case 'telefone':
      if (form.telefone && !validators.phone(form.telefone)) {
        errors.telefone = validationMessages.phone
        return false
      }
      errors.telefone = ''
      return true

    default:
      return true
  }
}

function validateForm(): boolean {
  const fields = ['nomeCompleto', 'cpf', 'email', 'telefone'] as const
  return fields.every(field => validateField(field))
}

function onCpfInput() {
  form.cpf = formatters.cpf(form.cpf)
}

function onTelefoneInput() {
  form.telefone = formatters.phone(form.telefone)
}

async function handleSubmit() {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const associadoData = {
      nomeCompleto: form.nomeCompleto,
      cpf: form.cpf,
      email: form.email,
      telefone: form.telefone || undefined,
    }

    if (isEditing.value) {
      await associadosStore.updateAssociado(props.associado!.id!, associadoData)
    } else {
      await associadosStore.createAssociado(associadoData)
    }

    emit('saved')
    close()
  } catch (error: any) {
    console.error('Erro ao salvar associado:', error)
    
    // Tratar erros específicos da API
    if (error.response?.status === 409) {
      const message = error.response.data.message || error.message
      if (message.includes('CPF')) {
        errors.cpf = 'Este CPF já está cadastrado'
      } else if (message.includes('email')) {
        errors.email = 'Este e-mail já está cadastrado'
      }
    } else {
      alert('Erro ao salvar associado. Tente novamente.')
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
    if (props.associado) {
      populateForm()
    } else {
      resetForm()
    }
  }
})
</script>
