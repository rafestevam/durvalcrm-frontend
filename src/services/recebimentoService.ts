import api from './api'
import type { Recebimento, RecebimentoForm } from '@/types/financeiro'

/**
 * Service for managing financial receipts (US-061)
 */
class RecebimentoService {
  private readonly endpoint = '/recebimentos'

  /**
   * Get all receipts
   */
  async findAll(): Promise<Recebimento[]> {
    const response = await api.get<Recebimento[]>(this.endpoint)
    return this.normalizeRecebimentosList(response as any as Recebimento[])
  }

  /**
   * Get receipts filtered by account ID
   */
  async findByContaId(contaId: string): Promise<Recebimento[]> {
    const response = await api.get<Recebimento[]>(this.endpoint, {
      params: { contaId }
    })
    return this.normalizeRecebimentosList(response as any as Recebimento[])
  }

  /**
   * Get receipts filtered by period
   */
  async findByPeriodo(dataInicio: string, dataFim: string): Promise<Recebimento[]> {
    const response = await api.get<Recebimento[]>(this.endpoint, {
      params: { dataInicio, dataFim }
    })
    return this.normalizeRecebimentosList(response as any as Recebimento[])
  }

  /**
   * Get receipt by ID
   */
  async findById(id: string): Promise<Recebimento> {
    const response = await api.get<Recebimento>(`${this.endpoint}/${id}`)
    return this.normalizeRecebimento(response as any as Recebimento)
  }

  /**
   * Create a new receipt
   */
  async create(data: RecebimentoForm): Promise<Recebimento> {
    const response = await api.post<Recebimento>(this.endpoint, data)
    return this.normalizeRecebimento(response as any as Recebimento)
  }

  /**
   * Delete a receipt
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`)
  }

  /**
   * Normalize date field from backend format [year, month, day] to ISO string
   */
  private normalizeRecebimento(recebimento: Recebimento): Recebimento {
    return {
      ...recebimento,
      dataRecebimento: this.normalizeDate(recebimento.dataRecebimento)
    }
  }

  /**
   * Normalize list of receipts
   */
  private normalizeRecebimentosList(recebimentos: Recebimento[]): Recebimento[] {
    return recebimentos.map(recebimento => this.normalizeRecebimento(recebimento))
  }

  /**
   * Convert date from backend format [year, month, day] to ISO string YYYY-MM-DD
   */
  private normalizeDate(date: string | number[]): string {
    if (typeof date === 'string') {
      return date
    }
    if (Array.isArray(date) && date.length === 3) {
      const [year, month, day] = date
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    return ''
  }
}

export default new RecebimentoService()
