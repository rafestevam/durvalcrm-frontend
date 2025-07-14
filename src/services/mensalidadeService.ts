import { api } from './api'
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
    const response = await api.get<ResumoMensalidades>('/mensalidades/resumo', {
      params: { mes, ano }
    })
    return response.data
  },

  /**
   * Lista mensalidades por período
   */
  async listarPorPeriodo(mes: number, ano: number): Promise<Mensalidade[]> {
    const response = await api.get<Mensalidade[]>('/mensalidades', {
      params: { mes, ano }
    })
    return response.data
  },

  /**
   * Gera cobranças para um período
   */
  async gerarCobrancas(mes: number, ano: number): Promise<ResultadoGeracao> {
    const response = await api.post<ResultadoGeracao>('/mensalidades/gerar', null, {
      params: { mes, ano }
    })
    return response.data
  },

  /**
   * Obtém QR Code de uma mensalidade específica
   */
  async obterQRCode(mensalidadeId: string): Promise<string> {
    const response = await api.get<{ qrCode: string }>(`/mensalidades/${mensalidadeId}/qrcode`)
    return response.data.qrCode
  }
}