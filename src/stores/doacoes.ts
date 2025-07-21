import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Doacao, DoacaoFormData, DoacaoEstatisticas } from '@/types/doacao'
import doacaoService from '@/services/doacaoService'

export const useDoacoesStore = defineStore('doacoes', () => {
  const doacoes = ref<Doacao[]>([])
  const doacaoAtual = ref<Doacao | null>(null)
  const estatisticas = ref<DoacaoEstatisticas | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const doacoesOrdenadas = computed(() => {
    return [...doacoes.value].sort((a, b) => 
      new Date(b.dataDoacao).getTime() - new Date(a.dataDoacao).getTime()
    )
  })

  const doacoesPorStatus = computed(() => {
    const grupos: Record<string, Doacao[]> = {
      PENDENTE: [],
      PROCESSANDO: [],
      CONFIRMADA: [],
      CANCELADA: []
    }
    
    doacoes.value.forEach(doacao => {
      if (grupos[doacao.status]) {
        grupos[doacao.status].push(doacao)
      }
    })
    
    return grupos
  })

  async function carregarDoacoes() {
    loading.value = true
    error.value = null
    try {
      doacoes.value = await doacaoService.listar()
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar doações'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarDoacoesPorAssociado(associadoId: number) {
    loading.value = true
    error.value = null
    try {
      doacoes.value = await doacaoService.listarPorAssociado(associadoId)
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar doações do associado'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarDoacao(id: number) {
    loading.value = true
    error.value = null
    try {
      doacaoAtual.value = await doacaoService.buscarPorId(id)
      return doacaoAtual.value
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function criarDoacao(dados: DoacaoFormData) {
    loading.value = true
    error.value = null
    try {
      const novaDoacao = await doacaoService.criar(dados)
      doacoes.value.push(novaDoacao)
      return novaDoacao
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function atualizarDoacao(id: number, dados: Partial<DoacaoFormData>) {
    loading.value = true
    error.value = null
    try {
      const doacaoAtualizada = await doacaoService.atualizar(id, dados)
      const index = doacoes.value.findIndex(d => d.id === id)
      if (index !== -1) {
        doacoes.value[index] = doacaoAtualizada
      }
      if (doacaoAtual.value?.id === id) {
        doacaoAtual.value = doacaoAtualizada
      }
      return doacaoAtualizada
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmarPagamento(id: number, codigoTransacao: string, metodoPagamento: string) {
    loading.value = true
    error.value = null
    try {
      const doacaoConfirmada = await doacaoService.confirmarPagamento(id, codigoTransacao, metodoPagamento)
      const index = doacoes.value.findIndex(d => d.id === id)
      if (index !== -1) {
        doacoes.value[index] = doacaoConfirmada
      }
      if (doacaoAtual.value?.id === id) {
        doacaoAtual.value = doacaoConfirmada
      }
      return doacaoConfirmada
    } catch (err: any) {
      error.value = err.message || 'Erro ao confirmar pagamento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelarDoacao(id: number) {
    loading.value = true
    error.value = null
    try {
      const doacaoCancelada = await doacaoService.cancelar(id)
      const index = doacoes.value.findIndex(d => d.id === id)
      if (index !== -1) {
        doacoes.value[index] = doacaoCancelada
      }
      if (doacaoAtual.value?.id === id) {
        doacaoAtual.value = doacaoCancelada
      }
      return doacaoCancelada
    } catch (err: any) {
      error.value = err.message || 'Erro ao cancelar doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function excluirDoacao(id: number) {
    loading.value = true
    error.value = null
    try {
      await doacaoService.excluir(id)
      doacoes.value = doacoes.value.filter(d => d.id !== id)
      if (doacaoAtual.value?.id === id) {
        doacaoAtual.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao excluir doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function carregarEstatisticas(inicio: Date, fim: Date) {
    loading.value = true
    error.value = null
    try {
      estatisticas.value = await doacaoService.obterEstatisticas(inicio, fim)
      return estatisticas.value
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar estatísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function gerarCodigoPix(id: number) {
    loading.value = true
    error.value = null
    try {
      const resultado = await doacaoService.gerarCodigoPix(id)
      return resultado.codigoPix
    } catch (err: any) {
      error.value = err.message || 'Erro ao gerar código PIX'
      throw err
    } finally {
      loading.value = false
    }
  }

  function limparErro() {
    error.value = null
  }

  return {
    doacoes,
    doacaoAtual,
    estatisticas,
    loading,
    error,
    doacoesOrdenadas,
    doacoesPorStatus,
    carregarDoacoes,
    carregarDoacoesPorAssociado,
    carregarDoacao,
    criarDoacao,
    atualizarDoacao,
    confirmarPagamento,
    cancelarDoacao,
    excluirDoacao,
    carregarEstatisticas,
    gerarCodigoPix,
    limparErro
  }
})