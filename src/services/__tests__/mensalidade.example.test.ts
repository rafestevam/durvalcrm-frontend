/**
 * Example Service Test: Mensalidade Service
 *
 * This test demonstrates:
 * - API service testing
 * - Axios mocking
 * - Error handling
 * - Request/response transformation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { createMockMensalidade } from '@/test/utils/mockFactories'
import { createMockApiHelper } from '@/test/utils/apiMockHelpers'
import type { Mensalidade } from '@/types'

// Mock service (simplified for demonstration)
class MensalidadeService {
  async listarTodas(): Promise<Mensalidade[]> {
    const response = await axios.get('/api/v1/mensalidades')
    return response.data
  }

  async buscarPorId(id: string): Promise<Mensalidade> {
    const response = await axios.get(`/api/v1/mensalidades/${id}`)
    return response.data
  }

  async criar(mensalidade: Partial<Mensalidade>): Promise<Mensalidade> {
    const response = await axios.post('/api/v1/mensalidades', mensalidade)
    return response.data
  }

  async marcarComoPaga(id: string, metodoPagamento: string): Promise<Mensalidade> {
    const response = await axios.put(`/api/v1/mensalidades/${id}/pagar`, {
      metodoPagamento
    })
    return response.data
  }

  async buscarPorAssociado(associadoId: string): Promise<Mensalidade[]> {
    const response = await axios.get(`/api/v1/mensalidades`, {
      params: { associadoId }
    })
    return response.data
  }

  async buscarPorStatus(status: string): Promise<Mensalidade[]> {
    const response = await axios.get(`/api/v1/mensalidades`, {
      params: { status }
    })
    return response.data
  }
}

describe('MensalidadeService', () => {
  let mockApi: MockAdapter
  let service: MensalidadeService

  beforeEach(() => {
    mockApi = new MockAdapter(axios)
    service = new MensalidadeService()
  })

  afterEach(() => {
    mockApi.reset()
    mockApi.restore()
  })

  describe('listarTodas', () => {
    it('deve listar todas as mensalidades', async () => {
      // Arrange
      const mockMensalidades = [
        createMockMensalidade({ status: 'PENDENTE' }),
        createMockMensalidade({ status: 'PAGA' })
      ]

      mockApi.onGet('/api/v1/mensalidades').reply(200, mockMensalidades)

      // Act
      const resultado = await service.listarTodas()

      // Assert
      expect(resultado).toHaveLength(2)
      expect(resultado[0].status).toBe('PENDENTE')
      expect(resultado[1].status).toBe('PAGA')
    })

    it('deve tratar erro ao listar mensalidades', async () => {
      // Arrange
      mockApi.onGet('/api/v1/mensalidades').reply(500, {
        message: 'Erro no servidor'
      })

      // Act & Assert
      await expect(service.listarTodas()).rejects.toThrow()
    })

    it('deve retornar array vazio quando não há mensalidades', async () => {
      // Arrange
      mockApi.onGet('/api/v1/mensalidades').reply(200, [])

      // Act
      const resultado = await service.listarTodas()

      // Assert
      expect(resultado).toEqual([])
    })
  })

  describe('buscarPorId', () => {
    it('deve buscar mensalidade por ID', async () => {
      // Arrange
      const mockMensalidade = createMockMensalidade({
        id: '123',
        associadoNome: 'João Silva'
      })

      mockApi.onGet('/api/v1/mensalidades/123').reply(200, mockMensalidade)

      // Act
      const resultado = await service.buscarPorId('123')

      // Assert
      expect(resultado.id).toBe('123')
      expect(resultado.associadoNome).toBe('João Silva')
    })

    it('deve retornar 404 quando mensalidade não existe', async () => {
      // Arrange
      mockApi.onGet('/api/v1/mensalidades/999').reply(404, {
        message: 'Mensalidade não encontrada'
      })

      // Act & Assert
      await expect(service.buscarPorId('999')).rejects.toThrow()
    })
  })

  describe('criar', () => {
    it('deve criar nova mensalidade', async () => {
      // Arrange
      const novaMensalidade = {
        associadoId: '123',
        mesReferencia: 5,
        anoReferencia: 2024,
        valor: 10.90
      }

      const mensalidadeCriada = createMockMensalidade(novaMensalidade)

      mockApi.onPost('/api/v1/mensalidades').reply(201, mensalidadeCriada)

      // Act
      const resultado = await service.criar(novaMensalidade)

      // Assert
      expect(resultado.associadoId).toBe('123')
      expect(resultado.mesReferencia).toBe(5)
      expect(resultado.anoReferencia).toBe(2024)
      expect(resultado.valor).toBe(10.90)
    })

    it('deve tratar erro de validação ao criar mensalidade', async () => {
      // Arrange
      const mensalidadeInvalida = {
        associadoId: '',
        mesReferencia: 13, // mês inválido
        anoReferencia: 2024,
        valor: -10
      }

      mockApi.onPost('/api/v1/mensalidades').reply(400, {
        message: 'Dados inválidos'
      })

      // Act & Assert
      await expect(service.criar(mensalidadeInvalida)).rejects.toThrow()
    })

    it('deve tratar duplicação de mensalidade', async () => {
      // Arrange
      const mensalidade = {
        associadoId: '123',
        mesReferencia: 5,
        anoReferencia: 2024,
        valor: 10.90
      }

      mockApi.onPost('/api/v1/mensalidades').reply(409, {
        message: 'Mensalidade já existe para este período'
      })

      // Act & Assert
      await expect(service.criar(mensalidade)).rejects.toThrow()
    })
  })

  describe('marcarComoPaga', () => {
    it('deve marcar mensalidade como paga', async () => {
      // Arrange
      const mensalidadePaga = createMockMensalidade({
        id: '123',
        status: 'PAGA',
        metodoPagamento: 'PIX',
        dataPagamento: new Date().toISOString()
      })

      mockApi.onPut('/api/v1/mensalidades/123/pagar').reply(200, mensalidadePaga)

      // Act
      const resultado = await service.marcarComoPaga('123', 'PIX')

      // Assert
      expect(resultado.status).toBe('PAGA')
      expect(resultado.metodoPagamento).toBe('PIX')
      expect(resultado.dataPagamento).toBeTruthy()
    })

    it('deve rejeitar pagamento de mensalidade já paga', async () => {
      // Arrange
      mockApi.onPut('/api/v1/mensalidades/123/pagar').reply(400, {
        message: 'Mensalidade já está paga'
      })

      // Act & Assert
      await expect(service.marcarComoPaga('123', 'PIX')).rejects.toThrow()
    })
  })

  describe('buscarPorAssociado', () => {
    it('deve buscar mensalidades por associado', async () => {
      // Arrange
      const associadoId = '123'
      const mockMensalidades = [
        createMockMensalidade({ associadoId }),
        createMockMensalidade({ associadoId })
      ]

      mockApi.onGet('/api/v1/mensalidades', { params: { associadoId } })
        .reply(200, mockMensalidades)

      // Act
      const resultado = await service.buscarPorAssociado(associadoId)

      // Assert
      expect(resultado).toHaveLength(2)
      expect(resultado.every(m => m.associadoId === associadoId)).toBe(true)
    })
  })

  describe('buscarPorStatus', () => {
    it('deve buscar mensalidades por status', async () => {
      // Arrange
      const status = 'PENDENTE'
      const mockMensalidades = [
        createMockMensalidade({ status }),
        createMockMensalidade({ status })
      ]

      mockApi.onGet('/api/v1/mensalidades', { params: { status } })
        .reply(200, mockMensalidades)

      // Act
      const resultado = await service.buscarPorStatus(status)

      // Assert
      expect(resultado).toHaveLength(2)
      expect(resultado.every(m => m.status === status)).toBe(true)
    })

    it('deve retornar array vazio quando não há mensalidades com o status', async () => {
      // Arrange
      const status = 'VENCIDA'

      mockApi.onGet('/api/v1/mensalidades', { params: { status } })
        .reply(200, [])

      // Act
      const resultado = await service.buscarPorStatus(status)

      // Assert
      expect(resultado).toEqual([])
    })
  })

  describe('Integração com Helper', () => {
    it('deve usar MockApiHelper para configurar mocks', async () => {
      // Arrange
      const mockHelper = createMockApiHelper(axios)
      const mockMensalidades = [createMockMensalidade()]

      mockHelper.onGet('/api/v1/mensalidades', mockMensalidades)

      // Act
      const resultado = await service.listarTodas()

      // Assert
      expect(resultado).toEqual(mockMensalidades)

      // Cleanup
      mockHelper.restore()
    })

    it('deve simular erro de rede', async () => {
      // Arrange
      const mockHelper = createMockApiHelper(axios)
      mockHelper.onNetworkError('get', '/api/v1/mensalidades')

      // Act & Assert
      await expect(service.listarTodas()).rejects.toThrow()

      // Cleanup
      mockHelper.restore()
    })

    it('deve simular timeout', async () => {
      // Arrange
      const mockHelper = createMockApiHelper(axios)
      mockHelper.onTimeout('get', '/api/v1/mensalidades')

      // Act & Assert
      await expect(service.listarTodas()).rejects.toThrow()

      // Cleanup
      mockHelper.restore()
    })
  })
})
