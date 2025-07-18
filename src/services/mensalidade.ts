import apiService from './api'
import { API_ENDPOINTS } from '@/utils/constants'
import type { 
  Mensalidade, 
  ResumoMensalidades, 
  ResultadoGeracao 
} from './types'

// Validações
function validarPeriodo(mes: number, ano: number): void {
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error('Mês deve ser um número inteiro entre 1 e 12')
  }
  
  if (!Number.isInteger(ano) || ano < 2020 || ano > 2030) {
    throw new Error('Ano deve ser um número inteiro entre 2020 e 2030')
  }
}

function validarId(id: string): void {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('ID é obrigatório e deve ser uma string válida')
  }
}

export const mensalidadeService = {
  /**
   * Obtém resumo das mensalidades por período
   */
  async obterResumo(mes: number, ano: number): Promise<ResumoMensalidades> {
    try {
      validarPeriodo(mes, ano)
      
      console.log(`Obtendo resumo para ${mes}/${ano}`)
      
      const response = await apiService.get<ResumoMensalidades>(
        API_ENDPOINTS.MENSALIDADES.RESUMO, 
        {
          params: { mes, ano }
        }
      )
      
      return response
    } catch (error) {
      console.error('Erro ao obter resumo:', error)
      throw error
    }
  },

  /**
   * Lista mensalidades por período
   */
  async listarPorPeriodo(mes: number, ano: number): Promise<Mensalidade[]> {
    try {
      validarPeriodo(mes, ano)
      
      console.log(`Listando mensalidades para ${mes}/${ano}`)
      
      const response = await apiService.get<Mensalidade[]>(
        API_ENDPOINTS.MENSALIDADES.LIST, 
        {
          params: { mes, ano }
        }
      )
      
      return response || []
    } catch (error) {
      console.error('Erro ao listar mensalidades:', error)
      throw error
    }
  },

  /**
   * Gera cobranças para um período
   */
  async gerarCobrancas(mes: number, ano: number): Promise<ResultadoGeracao> {
    try {
      validarPeriodo(mes, ano)
      
      console.log(`Gerando cobranças para ${mes}/${ano}`)
      
      const response = await apiService.post<ResultadoGeracao>(
        API_ENDPOINTS.MENSALIDADES.GERAR_COBRANCAS, 
        null, 
        {
          params: { mes, ano }
        }
      )
      
      return response
    } catch (error) {
      console.error('Erro ao gerar cobranças:', error)
      throw error
    }
  },

  /**
   * Obtém uma mensalidade específica
   */
  async obterPorId(id: string): Promise<Mensalidade> {
    try {
      validarId(id)
      
      const response = await apiService.get<Mensalidade>(
        API_ENDPOINTS.MENSALIDADES.GET(id)
      )
      
      return response
    } catch (error) {
      console.error(`Erro ao obter mensalidade ${id}:`, error)
      throw error
    }
  },

  /**
   * Lista mensalidades por status
   */
  async listarPorStatus(status: string): Promise<Mensalidade[]> {
    try {
      if (!status || typeof status !== 'string') {
        throw new Error('Status é obrigatório')
      }
      
      const statusValidos = ['PENDENTE', 'PAGA', 'ATRASADA', 'CANCELADA']
      if (!statusValidos.includes(status.toUpperCase())) {
        throw new Error(`Status deve ser um dos valores: ${statusValidos.join(', ')}`)
      }
      
      const response = await apiService.get<Mensalidade[]>(
        `/mensalidades/status/${status}`
      )
      
      return response || []
    } catch (error) {
      console.error(`Erro ao listar mensalidades por status ${status}:`, error)
      throw error
    }
  },

  /**
   * Atualiza uma mensalidade
   */
  async atualizar(id: string, dados: Partial<Mensalidade>): Promise<Mensalidade> {
    try {
      validarId(id)
      
      if (!dados || Object.keys(dados).length === 0) {
        throw new Error('Dados para atualização são obrigatórios')
      }
      
      const response = await apiService.put<Mensalidade>(
        API_ENDPOINTS.MENSALIDADES.UPDATE(id), 
        dados
      )
      
      return response
    } catch (error) {
      console.error(`Erro ao atualizar mensalidade ${id}:`, error)
      throw error
    }
  },

  /**
   * Marca uma mensalidade como paga
   */
  async marcarComoPaga(id: string, dadosPagamento?: {
    dataPagamento?: string
    observacao?: string
  }): Promise<void> {
    try {
      validarId(id)
      
      const dados = {
        dataPagamento: dadosPagamento?.dataPagamento || new Date().toISOString(),
        observacao: dadosPagamento?.observacao
      }
      
      await apiService.patch<void>(
        `/mensalidades/${id}/pagar`, 
        dados
      )
      
    } catch (error) {
      console.error(`Erro ao marcar mensalidade ${id} como paga:`, error)
      throw error
    }
  },

  /**
   * Obtém QR Code de uma mensalidade específica
   */
  async obterQRCode(mensalidadeId: string): Promise<string> {
    try {
      validarId(mensalidadeId)
      
      const response = await apiService.get<{ qrCode: string }>(
        API_ENDPOINTS.MENSALIDADES.QRCODE(mensalidadeId)
      )
      
      if (!response?.qrCode) {
        throw new Error('QR Code não encontrado na resposta')
      }
      
      return response.qrCode
    } catch (error) {
      console.error(`Erro ao obter QR Code da mensalidade ${mensalidadeId}:`, error)
      throw error
    }
  },

  /**
   * Cancela uma mensalidade
   */
  async cancelar(id: string, motivo?: string): Promise<Mensalidade> {
    try {
      validarId(id)
      
      const dados = {
        status: 'CANCELADA',
        observacao: motivo || 'Cancelada pelo usuário'
      }
      
      const response = await apiService.patch<Mensalidade>(
        API_ENDPOINTS.MENSALIDADES.UPDATE(id), 
        dados
      )
      
      return response
    } catch (error) {
      console.error(`Erro ao cancelar mensalidade ${id}:`, error)
      throw error
    }
  },

  /**
   * Envia cobrança por email
   */
  async enviarCobrancaPorEmail(id: string): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      validarId(id)
      
      const response = await apiService.post<{ sucesso: boolean; mensagem: string }>(
        `/mensalidades/${id}/enviar-email`
      )
      
      return response
    } catch (error) {
      console.error(`Erro ao enviar cobrança por email para mensalidade ${id}:`, error)
      throw error
    }
  },

  /**
   * Exporta mensalidades para planilha
   */
  async exportarPlanilha(
    mes: number, 
    ano: number, 
    formato: 'xlsx' | 'csv' = 'xlsx'
  ): Promise<void> {
    try {
      validarPeriodo(mes, ano)
      
      if (!['xlsx', 'csv'].includes(formato)) {
        throw new Error('Formato deve ser xlsx ou csv')
      }
      
      const filename = `mensalidades_${mes.toString().padStart(2, '0')}_${ano}.${formato}`
      
      await apiService.download('/mensalidades/exportar', filename, {
        params: { mes, ano, formato }
      })
    } catch (error) {
      console.error(`Erro ao exportar mensalidades para ${formato}:`, error)
      throw error
    }
  },

  /**
   * Obtém estatísticas de mensalidades
   */
  async obterEstatisticas(anoInicio: number, anoFim?: number): Promise<any> {
    try {
      if (!Number.isInteger(anoInicio) || anoInicio < 2020) {
        throw new Error('Ano de início deve ser >= 2020')
      }
      
      const params: any = { anoInicio }
      if (anoFim) {
        if (!Number.isInteger(anoFim) || anoFim < anoInicio) {
          throw new Error('Ano fim deve ser >= ano início')
        }
        params.anoFim = anoFim
      }
      
      const response = await apiService.get('/mensalidades/estatisticas', { params })
      return response
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      throw error
    }
  },

  /**
   * Valida se pode gerar cobranças para um período
   */
  async validarGeracaoCobrancas(mes: number, ano: number): Promise<{ 
    podeGerar: boolean; 
    motivo?: string; 
    totalAssociados: number 
  }> {
    try {
      validarPeriodo(mes, ano)
      
      const response = await apiService.get('/mensalidades/validar-geracao', {
        params: { mes, ano }
      })
      
      return response
    } catch (error) {
      console.error('Erro ao validar geração de cobranças:', error)
      throw error
    }
  }
}