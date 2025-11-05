import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dashboardFinanceiroService from '@/services/dashboardFinanceiroService'
import type { DashboardFinanceiroDTO, ExtratoContaDTO } from '@/types/financeiro'

/**
 * Store for financial dashboard and statement (US-062, US-064)
 */
export const useDashboardFinanceiroStore = defineStore('dashboardFinanceiro', () => {
  // State
  const dashboard = ref<DashboardFinanceiroDTO | null>(null)
  const extrato = ref<ExtratoContaDTO | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const saldoTotal = computed(() => dashboard.value?.saldoTotalConsolidado || 0)

  const contasBancarias = computed(() => dashboard.value?.contasBancarias || [])

  const caixasFisicos = computed(() => dashboard.value?.caixasFisicos || [])

  const recebimentosPeriodo = computed(() => dashboard.value?.recebimentosPeriodo || null)

  // Actions
  async function fetchDashboard(dataInicio?: string, dataFim?: string) {
    try {
      isLoading.value = true
      error.value = null
      dashboard.value = await dashboardFinanceiroService.getDashboard(dataInicio, dataFim)
    } catch (err) {
      error.value = 'Erro ao buscar dashboard financeiro'
      console.error('Erro ao buscar dashboard financeiro:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchExtrato(contaId: string, dataInicio?: string, dataFim?: string) {
    try {
      isLoading.value = true
      error.value = null
      extrato.value = await dashboardFinanceiroService.getExtrato(contaId, dataInicio, dataFim)
    } catch (err) {
      error.value = 'Erro ao buscar extrato da conta'
      console.error('Erro ao buscar extrato:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearExtrato() {
    extrato.value = null
  }

  return {
    // State
    dashboard,
    extrato,
    isLoading,
    error,

    // Computed
    saldoTotal,
    contasBancarias,
    caixasFisicos,
    recebimentosPeriodo,

    // Actions
    fetchDashboard,
    fetchExtrato,
    clearError,
    clearExtrato
  }
})
