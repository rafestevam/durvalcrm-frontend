import { apiService } from './api'
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
    const response = await apiService.get<ResumoMensalidades>('/mensalidades/resumo', {
      params: { mes, ano }
    })
    return response
  },

  /**
   * Lista mensalidades por período
   */
  async listarPorPeriodo(mes: number, ano: number): Promise<Mensalidade[]> {
    const response = await apiService.get<Mensalidade[]>('/mensalidades', {
      params: { mes, ano }
    })
    return response
  },

  /**
   * Gera cobranças para um período
   */
  async gerarCobrancas(mes: number, ano: number): Promise<ResultadoGeracao> {
    const response = await apiService.post<ResultadoGeracao>('/mensalidades/gerar', null, {
      params: { mes, ano }
    })
    return response
  },

  /**
   * Obtém QR Code de uma mensalidade específica
   */
  async obterQRCode(mensalidadeId: string): Promise<string> {
    const response = await apiService.get<{ qrCode: string }>(`/mensalidades/${mensalidadeId}/qrcode`)
    return response.qrCode
  }
}