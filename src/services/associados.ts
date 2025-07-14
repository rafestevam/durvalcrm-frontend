import apiService from './api'
import type { Associado } from './types'

export class AssociadosService {
  async findAll(search?: string): Promise<Associado[]> {
    const params = search ? { search } : {}
    return apiService.get<Associado[]>('/associados', { params })
  }

  async findById(id: string): Promise<Associado> {
    return apiService.get<Associado>(`/associados/${id}`)
  }

  async create(associado: Omit<Associado, 'id'>): Promise<Associado> {
    return apiService.post<Associado>('/associados', associado)
  }

  async update(id: string, associado: Partial<Associado>): Promise<Associado> {
    return apiService.put<Associado>(`/associados/${id}`, associado)
  }

  async delete(id: string): Promise<void> {
    return apiService.delete(`/associados/${id}`)
  }
}

export const associadosService = new AssociadosService()
