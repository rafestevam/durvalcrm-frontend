<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="associado" class="block text-sm font-medium text-gray-700">
        Associado <span class="text-sm text-gray-500">(opcional - para doações identificadas)</span>
      </label>
      <select
        id="associado"
        v-model="formData.associadoId"
        :disabled="isEdit"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="">Doação anônima</option>
        <option
          v-for="associado in associados"
          :key="associado.id"
          :value="associado.id"
        >
          {{ associado.nomeCompleto }} - CPF: {{ formatarCPF(associado.cpf) }}
        </option>
      </select>
    </div>

    <div>
      <label for="valor" class="block text-sm font-medium text-gray-700">
        Valor
      </label>
      <div class="mt-1 relative rounded-md shadow-sm">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500 sm:text-sm">R$</span>
        </div>
        <input
          id="valor"
          v-model.number="formData.valor"
          type="number"
          step="0.01"
          min="0"
          class="pl-12 focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
          placeholder="0,00"
          required
        />
      </div>
    </div>

    <div>
      <label for="tipo" class="block text-sm font-medium text-gray-700">
        Tipo de Doação
      </label>
      <select
        id="tipo"
        v-model="formData.tipo"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        required
      >
        <option value="">Selecione o tipo</option>
        <option value="UNICA">Doação Única</option>
        <option value="RECORRENTE">Doação Recorrente</option>
      </select>
    </div>

    <div>
      <label for="dataDoacao" class="block text-sm font-medium text-gray-700">
        Data da Doação
      </label>
      <input
        id="dataDoacao"
        v-model="formData.dataDoacao"
        type="datetime-local"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <div>
      <label for="descricao" class="block text-sm font-medium text-gray-700">
        Descrição (opcional)
      </label>
      <textarea
        id="descricao"
        v-model="formData.descricao"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="Adicione uma descrição para esta doação..."
      />
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        @click="$emit('cancelar')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancelar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ isEdit ? 'Atualizar' : 'Criar' }} Doação
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAssociadosStore } from '@/stores/associados'
import type { Doacao, DoacaoFormData, TipoDoacao } from '@/types/doacao'
import type { Associado } from '@/types/associado'
import { toLocalISOString } from '@/utils/dateUtils'

interface Props {
  doacao?: Doacao | null
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: DoacaoFormData]
  cancelar: []
}>()

const associadosStore = useAssociadosStore()
const associados = computed(() => associadosStore.associados)

const formData = ref<DoacaoFormData>({
  associadoId: '',
  valor: 0,
  tipo: 'UNICA' as TipoDoacao,
  descricao: '',
  dataDoacao: new Date().toISOString().slice(0, 16)
})

const isEdit = computed(() => !!props.doacao)

watch(() => props.doacao, (novaDoacao) => {
  if (novaDoacao) {
    formData.value = {
      associadoId: novaDoacao.associadoId,
      valor: novaDoacao.valor,
      tipo: novaDoacao.tipo,
      descricao: novaDoacao.descricao || '',
      dataDoacao: novaDoacao.dataDoacao ? novaDoacao.dataDoacao.slice(0, 16) : new Date().toISOString().slice(0, 16)
    }
  }
}, { immediate: true })

onMounted(async () => {
  if (associados.value.length === 0) {
    await associadosStore.carregarAssociados()
  }
})

function handleSubmit() {
  const dadosParaEnviar = {
    ...formData.value,
    dataDoacao: formData.value.dataDoacao ? toLocalISOString(new Date(formData.value.dataDoacao)) : undefined
  }
  emit('submit', dadosParaEnviar)
}

function formatarCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
</script>