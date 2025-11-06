<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Cabeçalho -->
      <div class="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Contas Bancárias e Caixa</h1>
          <p class="mt-2 text-sm text-gray-700">
            Gerencie suas contas bancárias e caixas físicos
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-3">
          <BaseButton variant="outline" @click="openRecebimentoModal" data-testid="conta-registrar-recebimento-button">
            + Registrar Recebimento
          </BaseButton>
          <BaseButton variant="primary" @click="openCreateModal" data-testid="conta-nova-button">
            + Nova Conta
          </BaseButton>
        </div>
      </div>

      <!-- Saldo Total Consolidado -->
      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium opacity-90">Saldo Total Consolidado</p>
            <p class="text-4xl font-bold mt-2">
              {{ formatCurrency(contaBancariaStore.saldoTotalConsolidado) }}
            </p>
            <p class="text-sm mt-2 opacity-75">
              {{ contaBancariaStore.contasAtivas.length }} conta(s) ativa(s)
            </p>
          </div>
          <BanknotesIcon class="w-16 h-16 opacity-50" />
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex gap-4">
          <BaseSelect
            v-model="filtroStatus"
            label="Status"
            @change="onFiltroChange"
            data-testid="conta-filtro-status-select"
          >
            <option value="">Todas</option>
            <option value="ATIVA">Ativas</option>
            <option value="INATIVA">Inativas</option>
          </BaseSelect>

          <BaseSelect
            v-model="filtroTipo"
            label="Tipo"
            @change="onFiltroChange"
            data-testid="conta-filtro-tipo-select"
          >
            <option value="">Todos</option>
            <option value="BANCARIA">Contas Bancárias</option>
            <option value="CAIXA_FISICO">Caixas Físicos</option>
          </BaseSelect>
        </div>
      </div>

      <!-- Lista de Contas -->
      <div>
        <div v-if="contaBancariaStore.isLoading" class="p-8 text-center bg-white rounded-lg shadow">
          <LoadingSpinner class="w-8 h-8 mx-auto mb-4" />
          <p class="text-gray-600">Carregando contas...</p>
        </div>

        <div
          v-else-if="contasFiltradas.length === 0"
          class="p-8 text-center bg-white rounded-lg shadow"
        >
          <BanknotesIcon class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p class="text-gray-600">Nenhuma conta encontrada</p>
          <BaseButton variant="primary" class="mt-4" @click="openCreateModal">
            + Criar primeira conta
          </BaseButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ContaBancariaCard
            v-for="conta in contasFiltradas"
            :key="conta.id"
            :conta="conta"
            @edit="openEditModal(conta)"
            @inativar="confirmInativar(conta)"
            @ver-extrato="verExtrato(conta)"
          />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ContaBancariaFormModal
      v-model:show="showFormModal"
      :conta="selectedConta"
      @saved="onContaSaved"
    />

    <RecebimentoFormModal
      v-model:show="showRecebimentoModal"
      @saved="onRecebimentoSaved"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BanknotesIcon } from '@heroicons/vue/24/outline'
import { useContaBancariaStore } from '@/stores/contaBancaria'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ContaBancariaCard from '@/components/financeiro/ContaBancariaCard.vue'
import ContaBancariaFormModal from '@/components/financeiro/ContaBancariaFormModal.vue'
import RecebimentoFormModal from '@/components/financeiro/RecebimentoFormModal.vue'
import { formatCurrency } from '@/utils/formatters'
import type { ContaBancaria } from '@/types/financeiro'

const router = useRouter()

const contaBancariaStore = useContaBancariaStore()

const showFormModal = ref(false)
const showRecebimentoModal = ref(false)
const selectedConta = ref<ContaBancaria | null>(null)
const filtroStatus = ref('')
const filtroTipo = ref('')

const contasFiltradas = computed(() => {
  let contas = contaBancariaStore.contas

  if (filtroStatus.value) {
    contas = contas.filter(c => c.status === filtroStatus.value)
  }

  if (filtroTipo.value) {
    contas = contas.filter(c => c.tipo === filtroTipo.value)
  }

  return contas
})

function openCreateModal() {
  selectedConta.value = null
  showFormModal.value = true
}

function openEditModal(conta: ContaBancaria) {
  selectedConta.value = conta
  showFormModal.value = true
}

function openRecebimentoModal() {
  showRecebimentoModal.value = true
}

async function confirmInativar(conta: ContaBancaria) {
  if (confirm(`Deseja realmente inativar a conta "${conta.nome}"?`)) {
    try {
      await contaBancariaStore.inativarConta(conta.id!)
      alert('Conta inativada com sucesso!')
    } catch (error) {
      console.error('Erro ao inativar conta:', error)
      alert('Erro ao inativar conta')
    }
  }
}

function verExtrato(conta: ContaBancaria) {
  router.push(`/financeiro/extrato/${conta.id}`)
}

async function onContaSaved() {
  await contaBancariaStore.fetchContas()
}

async function onRecebimentoSaved() {
  await contaBancariaStore.fetchContas()
}

function onFiltroChange() {
  // Filters are reactive via computed
}

onMounted(async () => {
  await contaBancariaStore.fetchContas()
})
</script>
