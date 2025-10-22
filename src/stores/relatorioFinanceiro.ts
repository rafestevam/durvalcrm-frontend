import { defineStore } from 'pinia'
import { ref } from 'vue'
import { relatorioFinanceiroService } from '@/services/relatorioFinanceiroService'
import type { ResumoFinanceiro, ReceitaPorCategoria, DespesaPorCategoria, FluxoCaixa } from '@/services/types'

export const useRelatorioFinanceiroStore = defineStore('relatorioFinanceiro', () => {
  // Estado
  const resumo = ref<ResumoFinanceiro | null>(null)
  const receitasPorCategoria = ref<ReceitaPorCategoria[]>([])
  const despesasPorCategoria = ref<DespesaPorCategoria[]>([])
  const fluxoCaixa = ref<FluxoCaixa | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchResumoFinanceiro(inicio: string, fim: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await relatorioFinanceiroService.obterResumoFinanceiro(inicio, fim)
      resumo.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar resumo financeiro'
      console.error('Erro ao buscar resumo financeiro:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchResumoMesAtual() {
    try {
      isLoading.value = true
      error.value = null
      const data = await relatorioFinanceiroService.obterResumoMesAtual()
      resumo.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar resumo do mês atual'
      console.error('Erro ao buscar resumo do mês atual:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchResumoAnoAtual() {
    try {
      isLoading.value = true
      error.value = null
      const data = await relatorioFinanceiroService.obterResumoAnoAtual()
      resumo.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar resumo do ano atual'
      console.error('Erro ao buscar resumo do ano atual:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReceitasPorCategoria(inicio: string, fim: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await relatorioFinanceiroService.obterReceitasPorCategoria(inicio, fim)
      receitasPorCategoria.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar receitas por categoria'
      console.error('Erro ao buscar receitas por categoria:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDespesasPorCategoria(inicio: string, fim: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await relatorioFinanceiroService.obterDespesasPorCategoria(inicio, fim)
      despesasPorCategoria.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar despesas por categoria'
      console.error('Erro ao buscar despesas por categoria:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchFluxoDeCaixa(inicio: string, fim: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await relatorioFinanceiroService.obterFluxoDeCaixa(inicio, fim)
      fluxoCaixa.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar fluxo de caixa'
      console.error('Erro ao buscar fluxo de caixa:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Estado
    resumo,
    receitasPorCategoria,
    despesasPorCategoria,
    fluxoCaixa,
    isLoading,
    error,

    // Actions
    fetchResumoFinanceiro,
    fetchResumoMesAtual,
    fetchResumoAnoAtual,
    fetchReceitasPorCategoria,
    fetchDespesasPorCategoria,
    fetchFluxoDeCaixa,
  }
})
