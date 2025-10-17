<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Receitas</h1>
          <p class="mt-2 text-sm text-gray-700">Gerencie as receitas da associação</p>
        </div>
        <BaseButton variant="primary" @click="openCreateModal">+ Nova Receita</BaseButton>
      </div>

      <!-- Filtros -->
      <div class="bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <BaseInput v-model="filtros.dataInicio" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <BaseInput v-model="filtros.dataFim" type="date" />
          </div>
          <div class="flex items-end">
            <BaseButton variant="outline" @click="aplicarFiltros" class="w-full">Filtrar</BaseButton>
          </div>
        </div>
      </div>

      <!-- Lista -->
      <div class="bg-white shadow rounded-lg">
        <div v-if="store.isLoading" class="p-8 text-center">
          <LoadingSpinner class="w-8 h-8 mx-auto mb-4" />
          <p class="text-gray-600">Carregando...</p>
        </div>
        <div v-else-if="store.receitas.length === 0" class="p-8 text-center">
          <p class="text-gray-600">Nenhuma receita encontrada</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="receita in store.receitas" :key="receita.id">
                <td>{{ formatarData(receita.dataReceita) }}</td>
                <td class="font-medium">{{ receita.descricao }}</td>
                <td class="text-green-600 font-semibold">{{ formatarValor(receita.valor) }}</td>
                <td>{{ receita.tipoReceita }}</td>
                <td>{{ receita.categoriaNome || '-' }}</td>
                <td>
                  <div class="flex space-x-2">
                    <BaseButton variant="outline" size="sm" @click="openEditModal(receita)">Editar</BaseButton>
                    <BaseButton variant="danger" size="sm" @click="deletar(receita.id!)">Excluir</BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <BaseModal v-model:show="showModal" :title="isEditMode ? 'Editar Receita' : 'Nova Receita'">
      <form @submit.prevent="salvar" class="space-y-4">
        <BaseInput v-model="form.descricao" label="Descrição *" required />
        <BaseInput v-model.number="form.valor" type="number" step="0.01" label="Valor *" required />
        <BaseInput v-model="form.dataReceita" type="date" label="Data Receita *" required />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select v-model="form.tipoReceita" class="w-full rounded-md border-gray-300" required>
            <option value="">Selecione...</option>
            <option value="MENSALIDADE">Mensalidade</option>
            <option value="DOACAO">Doação</option>
            <option value="VENDA">Venda</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select v-model="form.categoriaId" class="w-full rounded-md border-gray-300" required>
            <option value="">Selecione...</option>
            <option v-for="cat in categoriasReceita" :key="cat.id" :value="cat.id">
              {{ cat.nome }}
            </option>
          </select>
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <BaseButton type="button" variant="outline" @click="showModal = false">Cancelar</BaseButton>
          <BaseButton type="submit" variant="primary">{{ isEditMode ? 'Atualizar' : 'Criar' }}</BaseButton>
        </div>
      </form>
    </BaseModal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useReceitaStore } from '@/stores/receita'
import { useCategoriaFinanceiraStore } from '@/stores/categoriaFinanceira'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Receita, ReceitaForm } from '@/services/types'

const store = useReceitaStore()
const categoriaStore = useCategoriaFinanceiraStore()

const showModal = ref(false)
const selectedReceita = ref<Receita | null>(null)
const filtros = ref({ dataInicio: '', dataFim: '' })

const form = ref<ReceitaForm>({
  descricao: '',
  valor: 0,
  dataReceita: new Date().toISOString().split('T')[0],
  tipoReceita: '' as any,
  categoriaId: ''
})

const isEditMode = computed(() => !!selectedReceita.value)
const categoriasReceita = computed(() =>
  categoriaStore.categorias.filter(c => c.tipo === 'RECEITA' && c.ativa)
)

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarValor(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function openCreateModal() {
  selectedReceita.value = null
  form.value = {
    descricao: '',
    valor: 0,
    dataReceita: new Date().toISOString().split('T')[0],
    tipoReceita: '' as any,
    categoriaId: ''
  }
  showModal.value = true
}

function openEditModal(receita: Receita) {
  selectedReceita.value = receita
  form.value = {
    descricao: receita.descricao,
    valor: receita.valor,
    dataReceita: receita.dataReceita,
    tipoReceita: receita.tipoReceita,
    categoriaId: receita.categoriaId
  }
  showModal.value = true
}

async function salvar() {
  try {
    if (isEditMode.value && selectedReceita.value?.id) {
      await store.updateReceita(selectedReceita.value.id, form.value)
    } else {
      await store.createReceita(form.value)
    }
    showModal.value = false
    aplicarFiltros()
  } catch (error: any) {
    alert(error.message || 'Erro ao salvar receita')
  }
}

async function deletar(id: string) {
  if (confirm('Tem certeza que deseja excluir esta receita?')) {
    try {
      await store.deleteReceita(id)
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir receita')
    }
  }
}

async function aplicarFiltros() {
  if (filtros.value.dataInicio && filtros.value.dataFim) {
    await store.fetchReceitasPorPeriodo(filtros.value.dataInicio, filtros.value.dataFim)
  } else {
    await store.fetchReceitas()
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchReceitas(),
    categoriaStore.fetchCategorias()
  ])
})
</script>
