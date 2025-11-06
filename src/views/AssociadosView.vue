<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Cabeçalho -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gestão de Associados</h1>
          <p class="mt-2 text-sm text-gray-700">
            Gerencie os membros da associação
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button
            id="associado-adicionar"
            type="button"
            class="btn btn-primary"
            @click="openCreateModal"
          >
            + Adicionar Associado
          </button>
        </div>
      </div>

      <!-- Busca -->
      <div class="bg-white shadow rounded-lg">
        <div class="p-6">
          <input
            id="associado-buscar"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nome ou CPF..."
            class="form-input w-full"
            @input="onSearch"
          />
        </div>
      </div>

      <!-- Lista de Associados -->
      <div class="bg-white shadow rounded-lg">
        <div v-if="associadosStore.isLoading" class="p-8 text-center">
          <LoadingSpinner class="w-8 h-8 mx-auto mb-4" />
          <p class="text-gray-600">Carregando associados...</p>
        </div>

        <div v-else-if="associadosStore.associados.length === 0" class="p-8 text-center">
          <UsersIcon class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">Nenhum associado encontrado</p>
        </div>

        <div v-else class="overflow-hidden">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Nome Completo</th>
                <th>CPF</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="associado in associadosStore.associados" :key="associado.id">
                <td class="font-medium">{{ associado.nomeCompleto }}</td>
                <td>{{ associado.cpf }}</td>
                <td>{{ associado.email }}</td>
                <td>{{ associado.telefone || '-' }}</td>
                <td>
                  <div class="flex space-x-2">
                    <button
                      :id="`associado-editar-${associado.id}`"
                      type="button"
                      class="btn btn-outline text-sm px-3 py-1"
                      @click="openEditModal(associado)"
                    >
                      Editar
                    </button>
                    <button
                      :id="`associado-excluir-${associado.id}`"
                      type="button"
                      class="btn btn-danger text-sm px-3 py-1"
                      @click="confirmDelete(associado)"
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Formulário -->
    <AssociadoFormModal
      v-model:show="showFormModal"
      :associado="selectedAssociado"
      @saved="onAssociadoSaved"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UsersIcon } from '@heroicons/vue/24/outline'
import { useAssociadosStore } from '@/stores/associados'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AssociadoFormModal from '@/components/associados/AssociadoFormModal.vue'
import type { Associado } from '@/services/types'

const associadosStore = useAssociadosStore()

const searchQuery = ref('')
const showFormModal = ref(false)
const selectedAssociado = ref<Associado | null>(null)

let searchTimeout: NodeJS.Timeout

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    associadosStore.fetchAssociados(searchQuery.value)
  }, 300)
}

function openCreateModal() {
  selectedAssociado.value = null
  showFormModal.value = true
}

function openEditModal(associado: Associado) {
  selectedAssociado.value = { ...associado }
  showFormModal.value = true
}

function confirmDelete(associado: Associado) {
  if (confirm(`Tem certeza que deseja excluir ${associado.nomeCompleto}?`)) {
    deleteAssociado(associado.id!)
  }
}

async function deleteAssociado(id: string) {
  try {
    await associadosStore.deleteAssociado(id)
  } catch (error) {
    console.error('Erro ao excluir associado:', error)
    alert('Erro ao excluir associado')
  }
}

function onAssociadoSaved() {
  showFormModal.value = false
  selectedAssociado.value = null
}

onMounted(() => {
  associadosStore.fetchAssociados()
})
</script>
