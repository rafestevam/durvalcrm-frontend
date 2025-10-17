<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Cabeçalho -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Categorias Financeiras</h1>
          <p class="mt-2 text-sm text-gray-700">
            Gerencie as categorias de receitas e despesas
          </p>
        </div>
        <div class="mt-4 sm:mt-0">
          <BaseButton variant="primary" @click="openCreateModal">
            + Nova Categoria
          </BaseButton>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex gap-4">
          <select
            v-model="filtroTipo"
            class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            @change="aplicarFiltros"
          >
            <option value="">Todos os tipos</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>

          <select
            v-model="filtroStatus"
            class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            @change="aplicarFiltros"
          >
            <option value="">Todos os status</option>
            <option value="ativa">Ativas</option>
            <option value="inativa">Inativas</option>
          </select>
        </div>
      </div>

      <!-- Lista de Categorias -->
      <div class="bg-white shadow rounded-lg">
        <div v-if="store.isLoading" class="p-8 text-center">
          <LoadingSpinner class="w-8 h-8 mx-auto mb-4" />
          <p class="text-gray-600">Carregando categorias...</p>
        </div>

        <div v-else-if="categoriasFiltradas.length === 0" class="p-8 text-center">
          <p class="text-gray-600">Nenhuma categoria encontrada</p>
        </div>

        <div v-else class="overflow-hidden">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Cor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="categoria in categoriasFiltradas" :key="categoria.id">
                <td class="font-medium">{{ categoria.nome }}</td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="categoria.tipo === 'RECEITA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ categoria.tipo === 'RECEITA' ? 'Receita' : 'Despesa' }}
                  </span>
                </td>
                <td>{{ categoria.descricao || '-' }}</td>
                <td>
                  <div v-if="categoria.cor" class="flex items-center gap-2">
                    <div
                      class="w-6 h-6 rounded-full border border-gray-300"
                      :style="{ backgroundColor: categoria.cor }"
                    ></div>
                    <span class="text-sm text-gray-600">{{ categoria.cor }}</span>
                  </div>
                  <span v-else>-</span>
                </td>
                <td>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="categoria.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  >
                    {{ categoria.ativa ? 'Ativa' : 'Inativa' }}
                  </span>
                </td>
                <td>
                  <div class="flex space-x-2">
                    <BaseButton variant="outline" size="sm" @click="openEditModal(categoria)">
                      Editar
                    </BaseButton>
                    <BaseButton
                      v-if="categoria.ativa"
                      variant="warning"
                      size="sm"
                      @click="desativar(categoria.id!)"
                    >
                      Desativar
                    </BaseButton>
                    <BaseButton
                      v-else
                      variant="success"
                      size="sm"
                      @click="reativar(categoria.id!)"
                    >
                      Reativar
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Formulário -->
    <BaseModal v-model:show="showFormModal" :title="isEditMode ? 'Editar Categoria' : 'Nova Categoria'">
      <form @submit.prevent="salvar" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <BaseInput v-model="form.nome" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select
            v-model="form.tipo"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Selecione...</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            v-model="form.descricao"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows="3"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cor</label>
          <input
            v-model="form.cor"
            type="color"
            class="w-20 h-10 rounded border border-gray-300"
          />
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <BaseButton type="button" variant="outline" @click="showFormModal = false">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="store.isLoading">
            {{ isEditMode ? 'Atualizar' : 'Criar' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCategoriaFinanceiraStore } from '@/stores/categoriaFinanceira'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { CategoriaFinanceira, CategoriaFinanceiraForm, TipoCategoriaFinanceira } from '@/services/types'

const store = useCategoriaFinanceiraStore()

const showFormModal = ref(false)
const selectedCategoria = ref<CategoriaFinanceira | null>(null)
const filtroTipo = ref('')
const filtroStatus = ref('')

const form = ref<CategoriaFinanceiraForm>({
  nome: '',
  descricao: '',
  tipo: '' as TipoCategoriaFinanceira,
  cor: '#3B82F6'
})

const isEditMode = computed(() => !!selectedCategoria.value)

const categoriasFiltradas = computed(() => {
  let categorias = store.categorias

  if (filtroTipo.value) {
    categorias = categorias.filter(c => c.tipo === filtroTipo.value)
  }

  if (filtroStatus.value === 'ativa') {
    categorias = categorias.filter(c => c.ativa)
  } else if (filtroStatus.value === 'inativa') {
    categorias = categorias.filter(c => !c.ativa)
  }

  return categorias
})

function openCreateModal() {
  selectedCategoria.value = null
  form.value = {
    nome: '',
    descricao: '',
    tipo: '' as TipoCategoriaFinanceira,
    cor: '#3B82F6'
  }
  showFormModal.value = true
}

function openEditModal(categoria: CategoriaFinanceira) {
  selectedCategoria.value = categoria
  form.value = {
    nome: categoria.nome,
    descricao: categoria.descricao || '',
    tipo: categoria.tipo,
    cor: categoria.cor || '#3B82F6'
  }
  showFormModal.value = true
}

async function salvar() {
  try {
    if (isEditMode.value && selectedCategoria.value?.id) {
      await store.updateCategoria(selectedCategoria.value.id, form.value)
    } else {
      await store.createCategoria(form.value)
    }
    showFormModal.value = false
    aplicarFiltros()
  } catch (error: any) {
    alert(error.message || 'Erro ao salvar categoria')
  }
}

async function desativar(id: string) {
  if (confirm('Tem certeza que deseja desativar esta categoria?')) {
    try {
      await store.desativarCategoria(id)
    } catch (error: any) {
      alert(error.message || 'Erro ao desativar categoria')
    }
  }
}

async function reativar(id: string) {
  try {
    await store.reativarCategoria(id)
  } catch (error: any) {
    alert(error.message || 'Erro ao reativar categoria')
  }
}

function aplicarFiltros() {
  // Os filtros são aplicados via computed
}

onMounted(() => {
  store.fetchCategorias()
})
</script>
