import api from '@/services/api'
import type { Doacao, DoacaoFormData, DoacaoEstatisticas } from '@/types/doacao'

export default {
  async listar(resumo = false): Promise<Doacao[]> {
    const response = await api.get('/doacoes', { params: { resumo } })
    return response.data
  },

  async buscarPorId(id: number): Promise<Doacao> {
    const response = await api.get(`/doacoes/${id}`)
    return response.data
  },

  async listarPorAssociado(associadoId: number): Promise<Doacao[]> {
    const response = await api.get(`/doacoes/associado/${associadoId}`)
    return response.data
  },

  async listarPorPeriodo(inicio: Date, fim: Date): Promise<Doacao[]> {
    const params = {
      inicio: inicio.toISOString(),
      fim: fim.toISOString()
    }
    const response = await api.get('/doacoes/periodo', { params })
    return response.data
  },

  async criar(dados: DoacaoFormData): Promise<Doacao> {
    const response = await api.post('/doacoes', dados)
    return response.data
  },

  async atualizar(id: number, dados: Partial<DoacaoFormData>): Promise<Doacao> {
    const response = await api.put(`/doacoes/${id}`, dados)
    return response.data
  },

  async confirmarPagamento(id: number, codigoTransacao: string, metodoPagamento: string): Promise<Doacao> {
    const response = await api.post(`/doacoes/${id}/confirmar-pagamento`, {
      codigoTransacao,
      metodoPagamento
    })
    return response.data
  },

  async cancelar(id: number): Promise<Doacao> {
    const response = await api.post(`/doacoes/${id}/cancelar`)
    return response.data
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/doacoes/${id}`)
  },

  async obterEstatisticas(inicio: Date, fim: Date): Promise<DoacaoEstatisticas> {
    const params = {
      inicio: inicio.toISOString(),
      fim: fim.toISOString()
    }
    const response = await api.get('/doacoes/estatisticas', { params })
    return response.data
  },

  async gerarCodigoPix(id: number): Promise<{ codigoPix: string }> {
    const response = await api.get(`/doacoes/${id}/pix`)
    return response.data
  }
}