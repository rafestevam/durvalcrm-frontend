import { defineStore } from 'pinia'
import { ref } from 'vue'
import { despesaService } from '@/services/despesaService'
import type { Despesa, DespesaForm, StatusPagamentoDespesa } from '@/services/types'

export const useDespesaStore = defineStore('despesa', () => {
  // Estado
  const despesas = ref<Despesa[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchDespesas() {
    try {
      isLoading.value = true
      error.value = null
      const data = await despesaService.findAll()
      despesas.value = data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar despesas'
      console.error('Erro ao buscar despesas:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDespesasPorPeriodo(inicio: string, fim: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await despesaService.findByPeriodo(inicio, fim)
      despesas.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar despesas por período'
      console.error('Erro ao buscar despesas por período:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDespesasPorStatus(status: StatusPagamentoDespesa) {
    try {
      isLoading.value = true
      error.value = null
      const data = await despesaService.findByStatus(status)
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar despesas por status'
      console.error('Erro ao buscar despesas por status:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDespesasVencidas(dataReferencia?: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await despesaService.findVencidas(dataReferencia)
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar despesas vencidas'
      console.error('Erro ao buscar despesas vencidas:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createDespesa(despesa: DespesaForm) {
    try {
      isLoading.value = true
      error.value = null
      const novaDespesa = await despesaService.create(despesa)
      despesas.value.push(novaDespesa)
      return novaDespesa
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar despesa'
      console.error('Erro ao criar despesa:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateDespesa(id: string, despesa: Partial<DespesaForm>) {
    try {
      isLoading.value = true
      error.value = null
      const despesaAtualizada = await despesaService.update(id, despesa)

      const index = despesas.value.findIndex(d => d.id === id)
      if (index !== -1) {
        despesas.value[index] = despesaAtualizada
      }

      return despesaAtualizada
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar despesa'
      console.error('Erro ao atualizar despesa:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function marcarComoPaga(id: string, dataPagamento: string) {
    try {
      isLoading.value = true
      error.value = null
      const despesaPaga = await despesaService.marcarComoPaga(id, dataPagamento)

      const index = despesas.value.findIndex(d => d.id === id)
      if (index !== -1) {
        despesas.value[index] = despesaPaga
      }

      return despesaPaga
    } catch (err: any) {
      error.value = err.message || 'Erro ao marcar despesa como paga'
      console.error('Erro ao marcar despesa como paga:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function cancelarDespesa(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const despesaCancelada = await despesaService.cancelar(id)

      const index = despesas.value.findIndex(d => d.id === id)
      if (index !== -1) {
        despesas.value[index] = despesaCancelada
      }

      return despesaCancelada
    } catch (err: any) {
      error.value = err.message || 'Erro ao cancelar despesa'
      console.error('Erro ao cancelar despesa:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteDespesa(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await despesaService.delete(id)

      const index = despesas.value.findIndex(d => d.id === id)
      if (index !== -1) {
        despesas.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao deletar despesa'
      console.error('Erro ao deletar despesa:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Estado
    despesas,
    isLoading,
    error,

    // Actions
    fetchDespesas,
    fetchDespesasPorPeriodo,
    fetchDespesasPorStatus,
    fetchDespesasVencidas,
    createDespesa,
    updateDespesa,
    marcarComoPaga,
    cancelarDespesa,
    deleteDespesa,
  }
})
