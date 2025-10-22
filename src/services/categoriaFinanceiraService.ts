import apiService from './api'
import type { CategoriaFinanceira, CategoriaFinanceiraForm, TipoCategoriaFinanceira } from './types'

export class CategoriaFinanceiraService {
  private readonly basePath = '/categorias-financeiras'

  async findAll(): Promise<CategoriaFinanceira[]> {
    return apiService.get<CategoriaFinanceira[]>(this.basePath)
  }

  async findById(id: string): Promise<CategoriaFinanceira> {
    return apiService.get<CategoriaFinanceira>(`${this.basePath}/${id}`)
  }

  async findByTipo(tipo: TipoCategoriaFinanceira): Promise<CategoriaFinanceira[]> {
    return apiService.get<CategoriaFinanceira[]>(`${this.basePath}/tipo/${tipo}`)
  }

  async findAtivas(): Promise<CategoriaFinanceira[]> {
    return apiService.get<CategoriaFinanceira[]>(`${this.basePath}/ativas`)
  }

  async findAtivasPorTipo(tipo: TipoCategoriaFinanceira): Promise<CategoriaFinanceira[]> {
    return apiService.get<CategoriaFinanceira[]>(`${this.basePath}/ativas/${tipo}`)
  }

  async create(categoria: CategoriaFinanceiraForm): Promise<CategoriaFinanceira> {
    return apiService.post<CategoriaFinanceira>(this.basePath, categoria)
  }

  async update(id: string, categoria: Partial<CategoriaFinanceiraForm>): Promise<CategoriaFinanceira> {
    return apiService.put<CategoriaFinanceira>(`${this.basePath}/${id}`, categoria)
  }

  async desativar(id: string): Promise<void> {
    return apiService.put(`${this.basePath}/${id}/desativar`)
  }

  async reativar(id: string): Promise<CategoriaFinanceira> {
    return apiService.put<CategoriaFinanceira>(`${this.basePath}/${id}/reativar`)
  }
}

export const categoriaFinanceiraService = new CategoriaFinanceiraService()
