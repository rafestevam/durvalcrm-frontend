<template>
  <div class="card hover:shadow-lg transition-shadow duration-200">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="text-lg font-medium text-gray-900">
            {{ associado.nomeCompleto }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ associado.email }}
          </p>
          <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{{ associado.cpf }}</span>
            <span v-if="associado.telefone">{{ associado.telefone }}</span>
          </div>
        </div>

        <div class="flex space-x-2">
          <BaseButton
            variant="outline"
            size="sm"
            @click="$emit('edit', associado)"
          >
            Editar
          </BaseButton>
          <BaseButton
            variant="danger"
            size="sm"
            @click="$emit('delete', associado)"
          >
            Excluir
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/common/BaseButton.vue'
import type { Associado } from '@/services/types'

interface Props {
  associado: Associado
}

defineProps<Props>()

defineEmits<{
  edit: [associado: Associado]
  delete: [associado: Associado]
}>()
</script>
