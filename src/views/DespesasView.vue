<template>
  <AppLayout>
    <div class="space-y-6">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Despesas</h1>
          <p class="mt-2 text-sm text-gray-700">Gerencie as despesas da associação</p>
        </div>
        <BaseButton variant="primary" @click="openCreateModal">+ Nova Despesa</BaseButton>
      </div>

      <!-- Filtros -->
      <div class="bg-white shadow rounded-lg p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <BaseInput v-model="filtros.dataInicio" type="date" label="Data Início" />
          <BaseInput v-model="filtros.dataFim" type="date" label="Data Fim" />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="filtros.status" class="w-full rounded-md border-gray-300">
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
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
        <div v-else-if="store.despesas.length === 0" class="p-8 text-center">
          <p class="text-gray-600">Nenhuma despesa encontrada</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead class="table-header">
              <tr>
                <th>Data</th>
                <th>Vencimento</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr v-for="despesa in store.despesas" :key="despesa.id">
                <td>{{ formatarData(despesa.dataDespesa) }}</td>
                <td>{{ formatarData(despesa.dataVencimento) }}</td>
                <td class="font-medium">{{ despesa.descricao }}</td>
                <td class="text-red-600 font-semibold">{{ formatarValor(despesa.valor) }}</td>
                <td>{{ despesa.tipoDespesa }}</td>
                <td>
                  <span :class="getBadgeClass(despesa.statusPagamento)">
                    {{ despesa.statusPagamento }}
                  </span>
                </td>
                <td>
                  <div class="flex space-x-2">
                    <BaseButton v-if="despesa.statusPagamento === 'PENDENTE'" variant="success" size="sm" @click="marcarComoPaga(despesa.id!)">
                      Pagar
                    </BaseButton>
                    <BaseButton v-if="despesa.statusPagamento === 'PENDENTE'" variant="outline" size="sm" @click="openEditModal(despesa)">
                      Editar
                    </BaseButton>
                    <BaseButton v-if="despesa.statusPagamento === 'PENDENTE'" variant="danger" size="sm" @click="cancelar(despesa.id!)">
                      Cancelar
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <BaseModal v-model:show="showModal" :title="isEditMode ? 'Editar Despesa' : 'Nova Despesa'">
      <form @submit.prevent="salvar" class="space-y-4">
        <BaseInput v-model="form.descricao" label="Descrição *" required />
        <BaseInput v-model="form.valor as any" type="number" step="0.01" label="Valor *" required />
        <BaseInput v-model="form.dataDespesa" type="date" label="Data Despesa *" required />
        <BaseInput v-model="form.dataVencimento" type="date" label="Data Vencimento *" required />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select v-model="form.tipoDespesa" class="w-full rounded-md border-gray-300" required>
            <option value="">Selecione...</option>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="SERVICOS">Serviços</option>
            <option value="MATERIAIS">Materiais</option>
            <option value="SALARIOS">Salários</option>
            <option value="IMPOSTOS">Impostos</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
          <select v-model="form.categoriaId" class="w-full rounded-md border-gray-300" required>
            <option value="">Selecione...</option>
            <option v-for="cat in categoriasDespesa" :key="cat.id" :value="cat.id">
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
import { useDespesaStore } from '@/stores/despesa'
import { useCategoriaFinanceiraStore } from '@/stores/categoriaFinanceira'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Despesa, DespesaForm } from '@/services/types'

const store = useDespesaStore()
const categoriaStore = useCategoriaFinanceiraStore()

const showModal = ref(false)
const selectedDespesa = ref<Despesa | null>(null)
const filtros = ref({ dataInicio: '', dataFim: '', status: '' })

const form = ref<DespesaForm>({
  descricao: '',
  valor: 0,
  dataDespesa: new Date().toISOString().split('T')[0],
  dataVencimento: new Date().toISOString().split('T')[0],
  tipoDespesa: '' as any,
  statusPagamento: 'PENDENTE' as any,
  categoriaId: ''
})

const isEditMode = computed(() => !!selectedDespesa.value)
const categoriasDespesa = computed(() =>
  categoriaStore.categorias.filter(c => c.tipo === 'DESPESA' && c.ativa)
)

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarValor(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function getBadgeClass(status: string) {
  const classes = {
    PENDENTE: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    PAGO: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    CANCELADO: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || classes.PENDENTE
}

function openCreateModal() {
  selectedDespesa.value = null
  form.value = {
    descricao: '',
    valor: 0,
    dataDespesa: new Date().toISOString().split('T')[0],
    dataVencimento: new Date().toISOString().split('T')[0],
    tipoDespesa: '' as any,
    statusPagamento: 'PENDENTE' as any,
    categoriaId: ''
  }
  showModal.value = true
}

function openEditModal(despesa: Despesa) {
  selectedDespesa.value = despesa
  form.value = {
    descricao: despesa.descricao,
    valor: despesa.valor,
    dataDespesa: despesa.dataDespesa,
    dataVencimento: despesa.dataVencimento,
    tipoDespesa: despesa.tipoDespesa,
    statusPagamento: despesa.statusPagamento,
    categoriaId: despesa.categoriaId
  }
  showModal.value = true
}

async function salvar() {
  try {
    if (isEditMode.value && selectedDespesa.value?.id) {
      await store.updateDespesa(selectedDespesa.value.id, form.value)
    } else {
      await store.createDespesa(form.value)
    }
    showModal.value = false
    aplicarFiltros()
  } catch (error: any) {
    alert(error.message || 'Erro ao salvar despesa')
  }
}

async function marcarComoPaga(id: string) {
  const dataPagamento = new Date().toISOString().split('T')[0]
  try {
    await store.marcarComoPaga(id, dataPagamento)
  } catch (error: any) {
    alert(error.message || 'Erro ao marcar como paga')
  }
}

async function cancelar(id: string) {
  if (confirm('Tem certeza que deseja cancelar esta despesa?')) {
    try {
      await store.cancelarDespesa(id)
    } catch (error: any) {
      alert(error.message || 'Erro ao cancelar despesa')
    }
  }
}

async function aplicarFiltros() {
  if (filtros.value.dataInicio && filtros.value.dataFim) {
    await store.fetchDespesasPorPeriodo(filtros.value.dataInicio, filtros.value.dataFim)
  } else if (filtros.value.status) {
    await store.fetchDespesasPorStatus(filtros.value.status as any)
  } else {
    await store.fetchDespesas()
  }
}

onMounted(async () => {
  await Promise.all([
    store.fetchDespesas(),
    categoriaStore.fetchCategorias()
  ])
})
</script>
