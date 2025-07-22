import api from './api'
import type { DashboardData } from './types'

export const painelService = {
  async obterDashboard(mes: number, ano: number): Promise<DashboardData> {
    try {
      // Por enquanto, retornamos dados mockados
      // TODO: Implementar endpoint no backend
      const mockData: DashboardData = {
        receitaConsolidada: 1450.50,
        receitaMensalidades: 850.00,
        receitaCantina: 250.30,
        receitaBazar: 100.00,
        receitaLivros: 50.20,
        receitaDoacoes: 200.00,
        pagantesMes: 85,
        totalAssociados: 100,
        adimplentes: [
          { id: '1', nomeCompleto: 'Ana da Silva', email: 'ana.silva@email.com', cpf: '123.456.789-00' },
          { id: '2', nomeCompleto: 'Bruno Costa', email: 'bruno.costa@email.com', cpf: '234.567.890-11' },
          { id: '3', nomeCompleto: 'Carlos Dias', email: 'carlos.dias@email.com', cpf: '345.678.901-22' },
          { id: '4', nomeCompleto: 'Diana Ferreira', email: 'diana.ferreira@email.com', cpf: '456.789.012-33' },
          { id: '5', nomeCompleto: 'Eduardo Garcia', email: 'eduardo.garcia@email.com', cpf: '567.890.123-44' },
        ],
        inadimplentes: [
          { id: '6', nomeCompleto: 'Fernanda Lima', email: 'fernanda.lima@email.com', cpf: '678.901.234-55' },
          { id: '7', nomeCompleto: 'Gustavo Oliveira', email: 'gustavo.o@email.com', cpf: '789.012.345-66' },
          { id: '8', nomeCompleto: 'Helena Pereira', email: 'helena.pereira@email.com', cpf: '890.123.456-77' },
        ]
      }
      
      return mockData
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      throw error
    }
  },

  async obterDashboardReal(mes: number, ano: number): Promise<DashboardData> {
    const response = await api.get(`/dashboard`, {
      params: { mes, ano }
    })
    return response.data
  }
}