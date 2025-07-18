import apiService from './api'
import type { Venda, ResumoVendas } from './types'

/**
 * Valida ID
 */
function validarId(id: string): void {
  if (!id || id.trim() === '') {
    throw new Error('ID é obrigatório')
  }
}

/**
 * Valida período
 */
function validarPeriodo(dataInicio: string, dataFim: string): void {
  if (!dataInicio || !dataFim) {
    throw new Error('Data de início e fim são obrigatórias')
  }
  
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  
  if (inicio > fim) {
    throw new Error('Data de início deve ser anterior à data de fim')
  }
}

export const vendaService = {
  
  /**
   * Criar nova venda
   */
  async criar(venda: Omit<Venda, 'id' | 'dataVenda' | 'criadoEm' | 'atualizadoEm'>): Promise<Venda> {
    try {
      const response = await apiService.post<Venda>('/vendas', venda)
      return response
    } catch (error) {
      console.error('Erro ao criar venda:', error)
      throw error
    }
  },

  /**
   * Buscar venda por ID
   */
  async buscarPorId(id: string): Promise<Venda> {
    try {
      validarId(id)
      const response = await apiService.get<Venda>(`/vendas/${id}`)
      return response
    } catch (error) {
      console.error(`Erro ao buscar venda ${id}:`, error)
      throw error
    }
  },

  /**
   * Atualizar venda
   */
  async atualizar(id: string, venda: Omit<Venda, 'id' | 'dataVenda' | 'criadoEm' | 'atualizadoEm'>): Promise<Venda> {
    try {
      validarId(id)
      const response = await apiService.put<Venda>(`/vendas/${id}`, venda)
      return response
    } catch (error) {
      console.error(`Erro ao atualizar venda ${id}:`, error)
      throw error
    }
  },

  /**
   * Deletar venda
   */
  async deletar(id: string): Promise<void> {
    try {
      validarId(id)
      await apiService.delete(`/vendas/${id}`)
    } catch (error) {
      console.error(`Erro ao deletar venda ${id}:`, error)
      throw error
    }
  },

  /**
   * Listar todas as vendas
   */
  async listarTodas(): Promise<Venda[]> {
    try {
      const response = await apiService.get<Venda[]>('/vendas')
      return response
    } catch (error) {
      console.error('Erro ao listar vendas:', error)
      throw error
    }
  },

  /**
   * Listar vendas por período
   */
  async listarPorPeriodo(dataInicio: string, dataFim: string): Promise<Venda[]> {
    try {
      validarPeriodo(dataInicio, dataFim)
      const response = await apiService.get<Venda[]>(`/vendas/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`)
      return response
    } catch (error) {
      console.error('Erro ao listar vendas por período:', error)
      throw error
    }
  },

  /**
   * Listar vendas por associado
   */
  async listarPorAssociado(associadoId: string): Promise<Venda[]> {
    try {
      validarId(associadoId)
      const response = await apiService.get<Venda[]>(`/vendas/associado/${associadoId}`)
      return response
    } catch (error) {
      console.error(`Erro ao listar vendas do associado ${associadoId}:`, error)
      throw error
    }
  },

  /**
   * Listar vendas por origem
   */
  async listarPorOrigem(origem: 'CANTINA' | 'BAZAR' | 'LIVROS'): Promise<Venda[]> {
    try {
      const response = await apiService.get<Venda[]>(`/vendas/origem/${origem}`)
      return response
    } catch (error) {
      console.error(`Erro ao listar vendas da origem ${origem}:`, error)
      throw error
    }
  },

  /**
   * Listar vendas recentes (últimos 30 dias)
   */
  async listarRecentes(): Promise<Venda[]> {
    try {
      const response = await apiService.get<Venda[]>('/vendas/recentes')
      return response
    } catch (error) {
      console.error('Erro ao listar vendas recentes:', error)
      throw error
    }
  },

  /**
   * Obter resumo de vendas por período
   */
  async obterResumo(dataInicio: string, dataFim: string): Promise<ResumoVendas> {
    try {
      validarPeriodo(dataInicio, dataFim)
      const response = await apiService.get<ResumoVendas>(`/vendas/resumo?dataInicio=${dataInicio}&dataFim=${dataFim}`)
      return response
    } catch (error) {
      console.error('Erro ao obter resumo de vendas:', error)
      throw error
    }
  },

  /**
   * Obter resumo de vendas por origem e período
   */
  async obterResumoPorOrigem(origem: 'CANTINA' | 'BAZAR' | 'LIVROS', dataInicio: string, dataFim: string): Promise<ResumoVendas> {
    try {
      validarPeriodo(dataInicio, dataFim)
      const response = await apiService.get<ResumoVendas>(`/vendas/resumo/origem/${origem}?dataInicio=${dataInicio}&dataFim=${dataFim}`)
      return response
    } catch (error) {
      console.error(`Erro ao obter resumo de vendas da origem ${origem}:`, error)
      throw error
    }
  }
}

export default vendaService