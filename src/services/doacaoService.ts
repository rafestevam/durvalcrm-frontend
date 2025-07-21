import apiService from '@/services/api'
import type { Doacao, DoacaoFormData, DoacaoEstatisticas } from '@/types/doacao'
import { toLocalISOString } from '@/utils/dateUtils'

export default {
  async listar(resumo = false): Promise<Doacao[]> {
    return await apiService.get('/doacoes', { params: { resumo } })
  },

  async buscarPorId(id: string): Promise<Doacao> {
    return await apiService.get(`/doacoes/${id}`)
  },

  async listarPorAssociado(associadoId: string): Promise<Doacao[]> {
    return await apiService.get(`/doacoes/associado/${associadoId}`)
  },

  async listarPorPeriodo(inicio: Date, fim: Date): Promise<Doacao[]> {
    const params = {
      inicio: toLocalISOString(inicio),
      fim: toLocalISOString(fim)
    }
    return await apiService.get('/doacoes/periodo', { params })
  },

  async criar(dados: DoacaoFormData): Promise<Doacao> {
    // Converter data para formato LocalDateTime se presente
    const dadosFormatados = {
      ...dados,
      associadoId: dados.associadoId || undefined, // Enviar undefined em vez de string vazia
      dataDoacao: dados.dataDoacao ? toLocalISOString(new Date(dados.dataDoacao)) : undefined
    }
    return await apiService.post('/doacoes', dadosFormatados)
  },

  async atualizar(id: string, dados: Partial<DoacaoFormData>): Promise<Doacao> {
    return await apiService.put(`/doacoes/${id}`, dados)
  },

  async confirmarPagamento(id: string, codigoTransacao: string, metodoPagamento: string): Promise<Doacao> {
    return await apiService.post(`/doacoes/${id}/confirmar-pagamento`, {
      codigoTransacao,
      metodoPagamento
    })
  },

  async cancelar(id: string): Promise<Doacao> {
    return await apiService.post(`/doacoes/${id}/cancelar`)
  },

  async excluir(id: string): Promise<void> {
    await apiService.delete(`/doacoes/${id}`)
  },

  async obterEstatisticas(inicio: Date, fim: Date): Promise<DoacaoEstatisticas> {
    const params = {
      inicio: toLocalISOString(inicio),
      fim: toLocalISOString(fim)
    }
    return await apiService.get('/doacoes/estatisticas', { params })
  },

  async gerarCodigoPix(id: string): Promise<{ codigoPix: string }> {
    return await apiService.get(`/doacoes/${id}/pix`)
  }
}