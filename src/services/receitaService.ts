import apiService from './api'
import type { Receita, ReceitaForm, TipoReceita } from './types'

export class ReceitaService {
  private readonly basePath = '/receitas'

  async findAll(): Promise<Receita[]> {
    return apiService.get<Receita[]>(this.basePath)
  }

  async findById(id: string): Promise<Receita> {
    return apiService.get<Receita>(`${this.basePath}/${id}`)
  }

  async findByPeriodo(inicio: string, fim: string): Promise<Receita[]> {
    return apiService.get<Receita[]>(`${this.basePath}/periodo`, {
      params: { inicio, fim }
    })
  }

  async findByTipo(tipo: TipoReceita): Promise<Receita[]> {
    return apiService.get<Receita[]>(`${this.basePath}/tipo/${tipo}`)
  }

  async findByCategoria(categoriaId: string): Promise<Receita[]> {
    return apiService.get<Receita[]>(`${this.basePath}/categoria/${categoriaId}`)
  }

  async findByAssociado(associadoId: string): Promise<Receita[]> {
    return apiService.get<Receita[]>(`${this.basePath}/associado/${associadoId}`)
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

  async create(receita: ReceitaForm): Promise<Receita> {
    return apiService.post<Receita>(this.basePath, receita)
  }

  async update(id: string, receita: Partial<ReceitaForm>): Promise<Receita> {
    return apiService.put<Receita>(`${this.basePath}/${id}`, receita)
  }

  async delete(id: string): Promise<void> {
    return apiService.delete(`${this.basePath}/${id}`)
  }
}

export const receitaService = new ReceitaService()
