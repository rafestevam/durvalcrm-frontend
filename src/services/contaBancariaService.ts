import api from './api'
import type { ContaBancaria, ContaBancariaForm, StatusConta } from '@/types/financeiro'

/**
 * Service for managing bank accounts and cash boxes (US-060)
 */
class ContaBancariaService {
  private readonly endpoint = '/contas-bancarias'

  /**
   * Get all bank accounts
   */
  async findAll(): Promise<ContaBancaria[]> {
    const response = await api.get<ContaBancaria[]>(this.endpoint)
    return this.normalizeContasList(response as any as ContaBancaria[])
  }

  /**
   * Get accounts filtered by status
   */
  async findByStatus(status: StatusConta): Promise<ContaBancaria[]> {
    const response = await api.get<ContaBancaria[]>(this.endpoint, {
      params: { status }
    })
    return this.normalizeContasList(response as any as ContaBancaria[])
  }

  /**
   * Get account by ID
   */
  async findById(id: string): Promise<ContaBancaria> {
    const response = await api.get<ContaBancaria>(`${this.endpoint}/${id}`)
    return this.normalizeConta(response as any as ContaBancaria)
  }

  /**
   * Create a new account
   */
  async create(data: ContaBancariaForm): Promise<ContaBancaria> {
    const response = await api.post<ContaBancaria>(this.endpoint, data)
    return this.normalizeConta(response as any as ContaBancaria)
  }

  /**
   * Update an existing account
   */
  async update(id: string, data: ContaBancariaForm): Promise<ContaBancaria> {
    const response = await api.put<ContaBancaria>(`${this.endpoint}/${id}`, data)
    return this.normalizeConta(response as any as ContaBancaria)
  }

  /**
   * Deactivate an account
   */
  async inativar(id: string): Promise<void> {
    await api.put(`${this.endpoint}/${id}/inativar`)
  }

  /**
   * Get active accounts by finalidade (purpose)
   * US-067: Used to find accounts for automatic integration with sales
   */
  async findByFinalidade(finalidade: string): Promise<ContaBancaria[]> {
    const response = await api.get<ContaBancaria[]>(this.endpoint, {
      params: {
        finalidade,
        status: 'ATIVA'
      }
    })
    return this.normalizeContasList(response as any as ContaBancaria[])
  }

  /**
   * Get active accounts grouped by finalidade
   * US-067: Used to display available accounts by payment method
   */
  async getContasAtivasPorFinalidade(): Promise<Record<string, ContaBancaria[]>> {
    const contas = await this.findByStatus('ATIVA' as StatusConta)

    const grouped: Record<string, ContaBancaria[]> = {}

    contas.forEach(conta => {
      const finalidade = conta.finalidade
      if (!grouped[finalidade]) {
        grouped[finalidade] = []
      }
      grouped[finalidade].push(conta)
    })

    return grouped
  }

  /**
   * Normalize date field from backend format [year, month, day] to ISO string
   */
  private normalizeConta(conta: ContaBancaria): ContaBancaria {
    return {
      ...conta,
      dataSaldoInicial: this.normalizeDate(conta.dataSaldoInicial)
    }
  }

  /**
   * Normalize list of accounts
   */
  private normalizeContasList(contas: ContaBancaria[]): ContaBancaria[] {
    return contas.map(conta => this.normalizeConta(conta))
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

export default new ContaBancariaService()
