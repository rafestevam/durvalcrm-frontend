import apiService from './api'
import type { ResumoFinanceiro, ReceitaPorCategoria, DespesaPorCategoria, FluxoCaixa } from './types'

export class RelatorioFinanceiroService {
  private readonly basePath = '/relatorios-financeiros'

  async obterResumoFinanceiro(inicio: string, fim: string): Promise<ResumoFinanceiro> {
    return apiService.get<ResumoFinanceiro>(`${this.basePath}/resumo`, {
      params: { inicio, fim }
    })
  }

  async obterResumoMesAtual(): Promise<ResumoFinanceiro> {
    return apiService.get<ResumoFinanceiro>(`${this.basePath}/resumo/mes-atual`)
  }

  async obterResumoAnoAtual(): Promise<ResumoFinanceiro> {
    return apiService.get<ResumoFinanceiro>(`${this.basePath}/resumo/ano-atual`)
  }

  async obterReceitasPorCategoria(inicio: string, fim: string): Promise<ReceitaPorCategoria[]> {
    return apiService.get<ReceitaPorCategoria[]>(`${this.basePath}/receitas/por-categoria`, {
      params: { inicio, fim }
    })
  }

  async obterDespesasPorCategoria(inicio: string, fim: string): Promise<DespesaPorCategoria[]> {
    return apiService.get<DespesaPorCategoria[]>(`${this.basePath}/despesas/por-categoria`, {
      params: { inicio, fim }
    })
  }

  async obterFluxoDeCaixa(inicio: string, fim: string): Promise<FluxoCaixa> {
    return apiService.get<FluxoCaixa>(`${this.basePath}/fluxo-caixa`, {
      params: { inicio, fim }
    })
  }
}

export const relatorioFinanceiroService = new RelatorioFinanceiroService()
