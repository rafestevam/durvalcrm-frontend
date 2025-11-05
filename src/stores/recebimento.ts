import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import recebimentoService from '@/services/recebimentoService'
import type { Recebimento, RecebimentoForm, FormaPagamentoRecebimento, OrigemRecebimento } from '@/types/financeiro'

/**
 * Store for managing financial receipts (US-061)
 */
export const useRecebimentoStore = defineStore('recebimento', () => {
  // Estado
  const recebimentos = ref<Recebimento[]>([])
  const recebimentoAtual = ref<Recebimento | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const totalRecebimentos = computed(() =>
    recebimentos.value.reduce((total, r) => total + r.valor, 0)
  )

  const recebimentosPorFormaPagamento = computed(() => {
    const grupos: Record<FormaPagamentoRecebimento, number> = {
      PIX: 0,
      CARTAO_CREDITO: 0,
      CARTAO_DEBITO: 0,
      DINHEIRO: 0
    }

    recebimentos.value.forEach(r => {
      grupos[r.formaPagamento] += r.valor
    })

    return grupos
  })

  const recebimentosPorOrigem = computed(() => {
    const grupos: Record<OrigemRecebimento, number> = {
      MENSALIDADE: 0,
      VENDA_PRODUTOS: 0,
      TRANSFERENCIA_BAZAR: 0,
      VENDA_CANTINA: 0,
      OUTROS: 0
    }

    recebimentos.value.forEach(r => {
      grupos[r.origem] += r.valor
    })

    return grupos
  })

  // Actions
  async function fetchRecebimentos() {
    try {
      isLoading.value = true
      error.value = null
      const data = await recebimentoService.findAll()
      recebimentos.value = data
    } catch (err) {
      error.value = 'Erro ao buscar recebimentos'
      console.error('Erro ao buscar recebimentos:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecebimentosByContaId(contaId: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await recebimentoService.findByContaId(contaId)
      recebimentos.value = data
    } catch (err) {
      error.value = 'Erro ao buscar recebimentos por conta'
      console.error('Erro ao buscar recebimentos por conta:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecebimentosByPeriodo(dataInicio: string, dataFim: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await recebimentoService.findByPeriodo(dataInicio, dataFim)
      recebimentos.value = data
    } catch (err) {
      error.value = 'Erro ao buscar recebimentos por período'
      console.error('Erro ao buscar recebimentos por período:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecebimentoById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await recebimentoService.findById(id)
      recebimentoAtual.value = data
      return data
    } catch (err) {
      error.value = 'Erro ao buscar recebimento'
      console.error('Erro ao buscar recebimento:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createRecebimento(data: RecebimentoForm) {
    try {
      isLoading.value = true
      error.value = null
      const novoRecebimento = await recebimentoService.create(data)
      recebimentos.value.unshift(novoRecebimento) // Add to beginning for chronological order
      return novoRecebimento
    } catch (err) {
      error.value = 'Erro ao criar recebimento'
      console.error('Erro ao criar recebimento:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRecebimento(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await recebimentoService.delete(id)

      const index = recebimentos.value.findIndex(r => r.id === id)
      if (index !== -1) {
        recebimentos.value.splice(index, 1)
      }
    } catch (err) {
      error.value = 'Erro ao deletar recebimento'
      console.error('Erro ao deletar recebimento:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearRecebimentoAtual() {
    recebimentoAtual.value = null
  }

  return {
    // State
    recebimentos,
    recebimentoAtual,
    isLoading,
    error,

    // Computed
    totalRecebimentos,
    recebimentosPorFormaPagamento,
    recebimentosPorOrigem,

    // Actions
    fetchRecebimentos,
    fetchRecebimentosByContaId,
    fetchRecebimentosByPeriodo,
    fetchRecebimentoById,
    createRecebimento,
    deleteRecebimento,
    clearError,
    clearRecebimentoAtual
  }
})
