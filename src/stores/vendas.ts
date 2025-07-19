import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { vendaService } from '@/services/vendas'
import type { Venda, ResumoVendas } from '@/services/types'

export const useVendasStore = defineStore('vendas', () => {
  // Estado
  const vendas = ref<Venda[]>([])
  const vendasRecentes = ref<Venda[]>([])
  const resumo = ref<ResumoVendas | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Período selecionado
  const periodoSelecionado = ref({
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0]
  })

  // Computeds
  const totalVendas = computed(() => vendas.value.length)
  const valorTotalVendas = computed(() => 
    vendas.value.reduce((total, venda) => total + venda.valor, 0)
  )
  const valorMedioVenda = computed(() => 
    totalVendas.value > 0 ? valorTotalVendas.value / totalVendas.value : 0
  )

  // Vendas por origem
  const vendasPorOrigem = computed(() => {
    const resultado = {
      CANTINA: vendas.value.filter(v => v.origem === 'CANTINA'),
      BAZAR: vendas.value.filter(v => v.origem === 'BAZAR'),
      LIVROS: vendas.value.filter(v => v.origem === 'LIVROS')
    }
    return resultado
  })

  // Actions
  async function criarVenda(venda: Omit<Venda, 'id' | 'dataVenda' | 'criadoEm' | 'atualizadoEm'>) {
    try {
      loading.value = true
      error.value = null

      const novaVenda = await vendaService.criar(venda)
      vendas.value.unshift(novaVenda)
      vendasRecentes.value.unshift(novaVenda)

      return novaVenda
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar venda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function buscarVenda(id: string) {
    try {
      loading.value = true
      error.value = null

      const venda = await vendaService.buscarPorId(id)
      return venda
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar venda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function atualizarVenda(id: string, venda: Omit<Venda, 'id' | 'dataVenda' | 'criadoEm' | 'atualizadoEm'>) {
    try {
      loading.value = true
      error.value = null

      const vendaAtualizada = await vendaService.atualizar(id, venda)
      
      const index = vendas.value.findIndex(v => v.id === id)
      if (index !== -1) {
        vendas.value[index] = vendaAtualizada
      }

      return vendaAtualizada
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar venda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletarVenda(id: string) {
    try {
      loading.value = true
      error.value = null

      await vendaService.deletar(id)
      
      vendas.value = vendas.value.filter(v => v.id !== id)
      vendasRecentes.value = vendasRecentes.value.filter(v => v.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar venda'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarVendas() {
    try {
      loading.value = true
      error.value = null

      const resultado = await vendaService.listarTodas()
      vendas.value = resultado
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar vendas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarVendasPorPeriodo(dataInicio?: string, dataFim?: string) {
    try {
      loading.value = true
      error.value = null

      const inicio = dataInicio || periodoSelecionado.value.dataInicio
      const fim = dataFim || periodoSelecionado.value.dataFim

      const resultado = await vendaService.listarPorPeriodo(inicio, fim)
      vendas.value = resultado
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar vendas por período'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarVendasRecentes() {
    try {
      loading.value = true
      error.value = null

      const resultado = await vendaService.listarRecentes()
      vendasRecentes.value = resultado
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar vendas recentes'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarResumo(dataInicio?: string, dataFim?: string) {
    try {
      loading.value = true
      error.value = null

      const inicio = dataInicio || periodoSelecionado.value.dataInicio
      const fim = dataFim || periodoSelecionado.value.dataFim

      const resultado = await vendaService.obterResumo(inicio, fim)
      resumo.value = resultado
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar resumo'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarVendasPorOrigem(origem: 'CANTINA' | 'BAZAR' | 'LIVROS') {
    try {
      loading.value = true
      error.value = null

      const resultado = await vendaService.listarPorOrigem(origem)
      vendas.value = resultado
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar vendas por origem'
      throw err
    } finally {
      loading.value = false
    }
  }


  function alterarPeriodo(dataInicio: string, dataFim: string) {
    periodoSelecionado.value = { dataInicio, dataFim }
  }

  function periodoAnterior() {
    const inicio = new Date(periodoSelecionado.value.dataInicio)
    const fim = new Date(periodoSelecionado.value.dataFim)
    const diffDias = Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
    
    inicio.setDate(inicio.getDate() - diffDias - 1)
    fim.setDate(fim.getDate() - diffDias - 1)
    
    periodoSelecionado.value = {
      dataInicio: inicio.toISOString().split('T')[0],
      dataFim: fim.toISOString().split('T')[0]
    }
  }

  function proximoPeriodo() {
    const inicio = new Date(periodoSelecionado.value.dataInicio)
    const fim = new Date(periodoSelecionado.value.dataFim)
    const diffDias = Math.floor((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
    
    inicio.setDate(inicio.getDate() + diffDias + 1)
    fim.setDate(fim.getDate() + diffDias + 1)
    
    periodoSelecionado.value = {
      dataInicio: inicio.toISOString().split('T')[0],
      dataFim: fim.toISOString().split('T')[0]
    }
  }

  // Limpar estado
  function limparEstado() {
    vendas.value = []
    vendasRecentes.value = []
    resumo.value = null
    error.value = null
  }

  return {
    // Estado
    vendas,
    vendasRecentes,
    resumo,
    loading,
    error,
    periodoSelecionado,
    
    // Computeds
    totalVendas,
    valorTotalVendas,
    valorMedioVenda,
    vendasPorOrigem,
    
    // Actions
    criarVenda,
    buscarVenda,
    atualizarVenda,
    deletarVenda,
    carregarVendas,
    carregarVendasPorPeriodo,
    carregarVendasRecentes,
    carregarResumo,
    carregarVendasPorOrigem,
    alterarPeriodo,
    periodoAnterior,
    proximoPeriodo,
    limparEstado
  }
})