import apiService from './api'
import type { Despesa, DespesaForm, StatusPagamentoDespesa } from './types'

export class DespesaService {
  private readonly basePath = '/v1/despesas'

  async findAll(): Promise<Despesa[]> {
    return apiService.get<Despesa[]>(this.basePath)
  }

  async findById(id: string): Promise<Despesa> {
    return apiService.get<Despesa>(`${this.basePath}/${id}`)
  }

  async findByPeriodo(inicio: string, fim: string): Promise<Despesa[]> {
    return apiService.get<Despesa[]>(`${this.basePath}/periodo`, {
      params: { inicio, fim }
    })
  }

  async findByStatus(status: StatusPagamentoDespesa): Promise<Despesa[]> {
    return apiService.get<Despesa[]>(`${this.basePath}/status/${status}`)
  }

  async findByCategoria(categoriaId: string): Promise<Despesa[]> {
    return apiService.get<Despesa[]>(`${this.basePath}/categoria/${categoriaId}`)
  }

  async findVencidas(dataReferencia?: string): Promise<Despesa[]> {
    return apiService.get<Despesa[]>(`${this.basePath}/vencidas`, {
      params: dataReferencia ? { dataReferencia } : {}
    })
  }

  async contarVencidas(dataReferencia?: string): Promise<number> {
    const response = await apiService.get<{ count: number }>(`${this.basePath}/vencidas/count`, {
      params: dataReferencia ? { dataReferencia } : {}
    })
    return response.count
  }

  async somarPorPeriodo(inicio: string, fim: string): Promise<number> {
    const response = await apiService.get<{ total: number }>(`${this.basePath}/somar`, {
      params: { inicio, fim }
    })
    return response.total
  }

  async somarPorCategoriaEPeriodo(categoriaId: string, inicio: string, fim: string): Promise<number> {
    const response = await apiService.get<{ total: number }>(`${this.basePath}/somar/categoria/${categoriaId}`, {
      params: { inicio, fim }
    })
    return response.total
  }

  async create(despesa: DespesaForm): Promise<Despesa> {
    return apiService.post<Despesa>(this.basePath, despesa)
  }

  async update(id: string, despesa: Partial<DespesaForm>): Promise<Despesa> {
    return apiService.put<Despesa>(`${this.basePath}/${id}`, despesa)
  }

  async marcarComoPaga(id: string, dataPagamento: string): Promise<Despesa> {
    return apiService.patch<Despesa>(`${this.basePath}/${id}/marcar-paga`, { dataPagamento })
  }

  async cancelar(id: string): Promise<Despesa> {
    return apiService.patch<Despesa>(`${this.basePath}/${id}/cancelar`)
  }

  async delete(id: string): Promise<void> {
    return apiService.delete(`${this.basePath}/${id}`)
  }
}

export const despesaService = new DespesaService()
