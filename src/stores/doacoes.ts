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

  // Cache para estatísticas
  const CACHE_KEY = 'doacoes_estatisticas_cache'
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  // Funções de cache
  function salvarEstatisticasNoCache(stats: DoacaoEstatisticas, periodo: { inicio: Date, fim: Date }) {
    try {
      const cacheData = {
        estatisticas: stats,
        periodo,
        timestamp: Date.now()
      }
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Erro ao salvar estatísticas no cache:', error)
    }
  }

  function carregarEstatisticasDoCache(): { estatisticas: DoacaoEstatisticas, periodo: { inicio: Date, fim: Date } } | null {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      const agora = Date.now()
      
      // Verificar se o cache ainda é válido
      if (agora - cacheData.timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(CACHE_KEY)
        return null
      }

      return {
        estatisticas: cacheData.estatisticas,
        periodo: {
          inicio: new Date(cacheData.periodo.inicio),
          fim: new Date(cacheData.periodo.fim)
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar estatísticas do cache:', error)
      return null
    }
  }

  function limparCacheEstatisticas() {
    try {
      sessionStorage.removeItem(CACHE_KEY)
    } catch (error) {
      console.warn('Erro ao limpar cache de estatísticas:', error)
    }
  }

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

  async function carregarDoacoesPorAssociado(associadoId: string) {
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

  async function carregarDoacao(id: string) {
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
      
      // Limpar cache de estatísticas pois os dados mudaram
      limparCacheEstatisticas()
      
      return novaDoacao
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function atualizarDoacao(id: string, dados: Partial<DoacaoFormData>) {
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
      
      // Limpar cache de estatísticas pois os dados mudaram
      limparCacheEstatisticas()
      
      return doacaoAtualizada
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmarPagamento(id: string, codigoTransacao: string, metodoPagamento: string) {
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
      
      // Limpar cache de estatísticas pois os dados mudaram
      limparCacheEstatisticas()
      
      return doacaoConfirmada
    } catch (err: any) {
      error.value = err.message || 'Erro ao confirmar pagamento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelarDoacao(id: string) {
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
      
      // Limpar cache de estatísticas pois os dados mudaram
      limparCacheEstatisticas()
      
      return doacaoCancelada
    } catch (err: any) {
      error.value = err.message || 'Erro ao cancelar doação'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function excluirDoacao(id: string) {
    loading.value = true
    error.value = null
    try {
      await doacaoService.excluir(id)
      doacoes.value = doacoes.value.filter(d => d.id !== id)
      if (doacaoAtual.value?.id === id) {
        doacaoAtual.value = null
      }
      
      // Limpar cache de estatísticas pois os dados mudaram
      limparCacheEstatisticas()
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
      // Primeiro, tentar carregar do cache se ainda não temos estatísticas
      if (!estatisticas.value) {
        const cached = carregarEstatisticasDoCache()
        if (cached) {
          estatisticas.value = cached.estatisticas
        }
      }

      const novasEstatisticas = await doacaoService.obterEstatisticas(inicio, fim)
      // Só atualizar as estatísticas se a requisição foi bem-sucedida
      estatisticas.value = novasEstatisticas
      
      // Salvar no cache
      salvarEstatisticasNoCache(novasEstatisticas, { inicio, fim })
      
      return estatisticas.value
    } catch (err: any) {
      error.value = err.message || 'Erro ao carregar estatísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function gerarCodigoPix(id: string) {
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

  function inicializarEstatisticas() {
    // Tentar carregar estatísticas do cache ao inicializar o store
    if (!estatisticas.value) {
      const cached = carregarEstatisticasDoCache()
      if (cached) {
        estatisticas.value = cached.estatisticas
      }
    }
  }

  // Inicializar automaticamente
  inicializarEstatisticas()

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