import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import contaBancariaService from '@/services/contaBancariaService'
import { StatusConta } from '@/types/financeiro'
import type { ContaBancaria, ContaBancariaForm } from '@/types/financeiro'

/**
 * Store for managing bank accounts and cash boxes (US-060)
 */
export const useContaBancariaStore = defineStore('contaBancaria', () => {
  // Estado
  const contas = ref<ContaBancaria[]>([])
  const contaAtual = ref<ContaBancaria | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const contasAtivas = computed(() =>
    contas.value.filter(c => c.status === 'ATIVA')
  )

  const contasInativas = computed(() =>
    contas.value.filter(c => c.status === 'INATIVA')
  )

  const contasBancarias = computed(() =>
    contas.value.filter(c => c.tipo === 'BANCARIA')
  )

  const caixasFisicos = computed(() =>
    contas.value.filter(c => c.tipo === 'CAIXA_FISICO')
  )

  const saldoTotalConsolidado = computed(() =>
    contasAtivas.value.reduce((total, conta) => total + conta.saldoAtual, 0)
  )

  // Actions
  async function fetchContas() {
    try {
      isLoading.value = true
      error.value = null
      const data = await contaBancariaService.findAll()
      contas.value = data
    } catch (err) {
      error.value = 'Erro ao buscar contas bancárias'
      console.error('Erro ao buscar contas:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchContasByStatus(status: StatusConta) {
    try {
      isLoading.value = true
      error.value = null
      const data = await contaBancariaService.findByStatus(status)
      contas.value = data
    } catch (err) {
      error.value = 'Erro ao buscar contas por status'
      console.error('Erro ao buscar contas por status:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchContaById(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await contaBancariaService.findById(id)
      contaAtual.value = data
      return data
    } catch (err) {
      error.value = 'Erro ao buscar conta'
      console.error('Erro ao buscar conta:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createConta(data: ContaBancariaForm) {
    try {
      isLoading.value = true
      error.value = null
      const novaConta = await contaBancariaService.create(data)
      contas.value.push(novaConta)
      return novaConta
    } catch (err) {
      error.value = 'Erro ao criar conta'
      console.error('Erro ao criar conta:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateConta(id: string, data: ContaBancariaForm) {
    try {
      isLoading.value = true
      error.value = null
      const contaAtualizada = await contaBancariaService.update(id, data)

      const index = contas.value.findIndex(c => c.id === id)
      if (index !== -1) {
        contas.value[index] = contaAtualizada
      }

      if (contaAtual.value?.id === id) {
        contaAtual.value = contaAtualizada
      }

      return contaAtualizada
    } catch (err) {
      error.value = 'Erro ao atualizar conta'
      console.error('Erro ao atualizar conta:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function inativarConta(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await contaBancariaService.inativar(id)

      const conta = contas.value.find(c => c.id === id)
      if (conta) {
        conta.status = StatusConta.INATIVA
      }

      if (contaAtual.value?.id === id) {
        contaAtual.value.status = StatusConta.INATIVA
      }
    } catch (err) {
      error.value = 'Erro ao inativar conta'
      console.error('Erro ao inativar conta:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearContaAtual() {
    contaAtual.value = null
  }

  return {
    // State
    contas,
    contaAtual,
    isLoading,
    error,

    // Computed
    contasAtivas,
    contasInativas,
    contasBancarias,
    caixasFisicos,
    saldoTotalConsolidado,

    // Actions
    fetchContas,
    fetchContasByStatus,
    fetchContaById,
    createConta,
    updateConta,
    inativarConta,
    clearError,
    clearContaAtual
  }
})
