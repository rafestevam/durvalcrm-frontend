import api from './api'
import type { DashboardFinanceiroDTO, ExtratoContaDTO } from '@/types/financeiro'

/**
 * Service for financial dashboard and statement operations (US-062, US-064)
 */
class DashboardFinanceiroService {
  private readonly endpoint = '/dashboard-financeiro'

  /**
   * Get consolidated financial dashboard
   * US-062: Dashboard de Saldos Consolidados
   */
  async getDashboard(dataInicio?: string, dataFim?: string): Promise<DashboardFinanceiroDTO> {
    const params: Record<string, string> = {}
    if (dataInicio) params.dataInicio = dataInicio
    if (dataFim) params.dataFim = dataFim

    const response = await api.get<DashboardFinanceiroDTO>(this.endpoint, { params })
    return response as any as DashboardFinanceiroDTO
  }

  /**
   * Get detailed account statement
   * US-064: Extrato Detalhado por Conta
   */
  async getExtrato(contaId: string, dataInicio?: string, dataFim?: string): Promise<ExtratoContaDTO> {
    const params: Record<string, string> = {}
    if (dataInicio) params.dataInicio = dataInicio
    if (dataFim) params.dataFim = dataFim

    const response = await api.get<ExtratoContaDTO>(`${this.endpoint}/extrato/${contaId}`, { params })
    return response as any as ExtratoContaDTO
  }
}

export default new DashboardFinanceiroService()
