import { apiService } from './api'
import { API_ENDPOINTS } from '@/utils/constants'
import type { 
  Mensalidade, 
  ResumoMensalidades, 
  ResultadoGeracao,
  ApiResponse 
} from './types'

export const mensalidadeService = {
  /**
   * Obtém resumo das mensalidades por período
   */
  async obterResumo(mes: number, ano: number): Promise<ResumoMensalidades> {
    const response = await apiService.get<ResumoMensalidades>(API_ENDPOINTS.MENSALIDADES.RESUMO, {
      params: { mes, ano }
    })
    return response
  },

  /**
   * Lista mensalidades por período
   */
  async listarPorPeriodo(mes: number, ano: number): Promise<Mensalidade[]> {
    const response = await apiService.get<Mensalidade[]>(API_ENDPOINTS.MENSALIDADES.LIST, {
      params: { mes, ano }
    })
    return response
  },

  /**
   * Gera cobranças para um período
   */
  async gerarCobrancas(mes: number, ano: number): Promise<ResultadoGeracao> {
    const response = await apiService.post<ResultadoGeracao>(API_ENDPOINTS.MENSALIDADES.GERAR_COBRANCAS, null, {
      params: { mes, ano }
    })
    return response
  },

  /**
   * Obtém uma mensalidade específica
   */
  async obterPorId(id: string): Promise<Mensalidade> {
    const response = await apiService.get<Mensalidade>(API_ENDPOINTS.MENSALIDADES.GET(id))
    return response
  },

  /**
   * Atualiza uma mensalidade
   */
  async atualizar(id: string, dados: Partial<Mensalidade>): Promise<Mensalidade> {
    const response = await apiService.put<Mensalidade>(API_ENDPOINTS.MENSALIDADES.UPDATE(id), dados)
    return response
  },

  /**
   * Marca uma mensalidade como paga
   */
  async marcarComoPaga(id: string, dadosPagamento?: {
    dataPagamento?: string
    valorPago?: number
    observacao?: string
  }): Promise<Mensalidade> {
    const response = await apiService.patch<Mensalidade>(
      API_ENDPOINTS.MENSALIDADES.UPDATE(id), 
      {
        status: 'PAGA',
        dataPagamento: dadosPagamento?.dataPagamento || new Date().toISOString(),
        valorPago: dadosPagamento?.valorPago,
        observacao: dadosPagamento?.observacao
      }
    )
    return response
  },

  /**
   * Obtém QR Code de uma mensalidade específica
   */
  async obterQRCode(mensalidadeId: string): Promise<string> {
    const response = await apiService.get<{ qrCode: string }>(API_ENDPOINTS.MENSALIDADES.QRCODE(mensalidadeId))
    return response.qrCode
  },

  /**
   * Cancela uma mensalidade
   */
  async cancelar(id: string, motivo?: string): Promise<Mensalidade> {
    const response = await apiService.patch<Mensalidade>(
      API_ENDPOINTS.MENSALIDADES.UPDATE(id), 
      {
        status: 'CANCELADA',
        observacao: motivo
      }
    )
    return response
  },

  /**
   * Envia cobrança por email
   */
  async enviarCobrancaPorEmail(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    const response = await apiService.post<{ sucesso: boolean; mensagem: string }>(
      `/mensalidades/${id}/enviar-email`
    )
    return response
  },

  /**
   * Exporta mensalidades para planilha
   */
  async exportarPlanilha(mes: number, ano: number, formato: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob> {
    const response = await apiService.get<Blob>('/mensalidades/exportar', {
      params: { mes, ano, formato },
      responseType: 'blob'
    })
    return response
  }
}