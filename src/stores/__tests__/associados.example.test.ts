/**
 * Example Store Test: Associados Store
 *
 * This test demonstrates:
 * - Pinia store testing
 * - API mocking with axios-mock-adapter
 * - Async action testing
 * - State management testing
 * - Error handling testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { defineStore } from 'pinia'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { createMockAssociado, createMockPaginatedResponse } from '@/test/utils/mockFactories'
import type { Associado } from '@/types'

// Mock store definition (simplified for demonstration)
const useAssociadosStore = defineStore('associados', {
  state: () => ({
    associados: [] as Associado[],
    loading: false,
    error: null as string | null,
    selectedAssociado: null as Associado | null
  }),

  actions: {
    async fetchAssociados() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get('/api/v1/associados')
        this.associados = response.data
      } catch (error: any) {
        this.error = error.message || 'Erro ao buscar associados'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createAssociado(associado: Omit<Associado, 'id'>) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post('/api/v1/associados', associado)
        this.associados.push(response.data)
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Erro ao criar associado'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAssociado(id: string, associado: Partial<Associado>) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.put(`/api/v1/associados/${id}`, associado)
        const index = this.associados.findIndex(a => a.id === id)
        if (index !== -1) {
          this.associados[index] = response.data
        }
        return response.data
      } catch (error: any) {
        this.error = error.message || 'Erro ao atualizar associado'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteAssociado(id: string) {
      this.loading = true
      this.error = null

      try {
        await axios.delete(`/api/v1/associados/${id}`)
        this.associados = this.associados.filter(a => a.id !== id)
      } catch (error: any) {
        this.error = error.message || 'Erro ao deletar associado'
        throw error
      } finally {
        this.loading = false
      }
    },

    selectAssociado(associado: Associado | null) {
      this.selectedAssociado = associado
    }
  }
})

describe('Associados Store', () => {
  let mockApi: MockAdapter
  let store: ReturnType<typeof useAssociadosStore>

  beforeEach(() => {
    // Create fresh Pinia instance
    setActivePinia(createPinia())
    store = useAssociadosStore()

    // Setup axios mock
    mockApi = new MockAdapter(axios)
  })

  afterEach(() => {
    mockApi.reset()
  })

  describe('Estado Inicial', () => {
    it('deve ter estado inicial correto', () => {
      expect(store.associados).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
      expect(store.selectedAssociado).toBeNull()
    })
  })

  describe('fetchAssociados', () => {
    it('deve buscar associados com sucesso', async () => {
      // Arrange
      const mockAssociados = [
        createMockAssociado({ nomeCompleto: 'João Silva' }),
        createMockAssociado({ nomeCompleto: 'Maria Santos' })
      ]

      mockApi.onGet('/api/v1/associados').reply(200, mockAssociados)

      // Act
      await store.fetchAssociados()

      // Assert
      expect(store.associados).toHaveLength(2)
      expect(store.associados[0].nomeCompleto).toBe('João Silva')
      expect(store.associados[1].nomeCompleto).toBe('Maria Santos')
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('deve definir loading como true durante a requisição', async () => {
      // Arrange
      mockApi.onGet('/api/v1/associados').reply(() => {
        expect(store.loading).toBe(true)
        return [200, []]
      })

      // Act
      await store.fetchAssociados()

      // Assert
      expect(store.loading).toBe(false)
    })

    it('deve tratar erro ao buscar associados', async () => {
      // Arrange
      mockApi.onGet('/api/v1/associados').reply(500, {
        message: 'Erro no servidor'
      })

      // Act & Assert
      await expect(store.fetchAssociados()).rejects.toThrow()
      expect(store.error).toBeTruthy()
      expect(store.loading).toBe(false)
    })

    it('deve tratar erro de rede', async () => {
      // Arrange
      mockApi.onGet('/api/v1/associados').networkError()

      // Act & Assert
      await expect(store.fetchAssociados()).rejects.toThrow()
      expect(store.error).toBeTruthy()
      expect(store.loading).toBe(false)
    })
  })

  describe('createAssociado', () => {
    it('deve criar novo associado com sucesso', async () => {
      // Arrange
      const novoAssociado = {
        nomeCompleto: 'Novo Associado',
        cpf: '111.222.333-44',
        email: 'novo@example.com',
        telefone: '(11) 99999-9999',
        ativo: true
      }

      const associadoCriado = createMockAssociado(novoAssociado)
      mockApi.onPost('/api/v1/associados').reply(201, associadoCriado)

      // Act
      const resultado = await store.createAssociado(novoAssociado)

      // Assert
      expect(resultado.nomeCompleto).toBe('Novo Associado')
      expect(store.associados).toContainEqual(associadoCriado)
      expect(store.error).toBeNull()
    })

    it('deve tratar erro de validação ao criar associado', async () => {
      // Arrange
      const associadoInvalido = {
        nomeCompleto: '',
        cpf: 'cpf-invalido',
        email: 'email-invalido',
        telefone: '',
        ativo: true
      }

      mockApi.onPost('/api/v1/associados').reply(400, {
        message: 'Dados inválidos'
      })

      // Act & Assert
      await expect(store.createAssociado(associadoInvalido)).rejects.toThrow()
      expect(store.error).toBeTruthy()
      expect(store.associados).toHaveLength(0)
    })
  })

  describe('updateAssociado', () => {
    it('deve atualizar associado existente', async () => {
      // Arrange
      const associadoExistente = createMockAssociado({
        id: '123',
        nomeCompleto: 'Nome Antigo'
      })
      store.associados = [associadoExistente]

      const dadosAtualizados = { nomeCompleto: 'Nome Novo' }
      const associadoAtualizado = { ...associadoExistente, ...dadosAtualizados }

      mockApi.onPut('/api/v1/associados/123').reply(200, associadoAtualizado)

      // Act
      await store.updateAssociado('123', dadosAtualizados)

      // Assert
      expect(store.associados[0].nomeCompleto).toBe('Nome Novo')
      expect(store.error).toBeNull()
    })

    it('deve tratar erro ao atualizar associado inexistente', async () => {
      // Arrange
      mockApi.onPut('/api/v1/associados/999').reply(404, {
        message: 'Associado não encontrado'
      })

      // Act & Assert
      await expect(store.updateAssociado('999', { nomeCompleto: 'Novo Nome' }))
        .rejects.toThrow()
      expect(store.error).toBeTruthy()
    })
  })

  describe('deleteAssociado', () => {
    it('deve deletar associado com sucesso', async () => {
      // Arrange
      const associado1 = createMockAssociado({ id: '1' })
      const associado2 = createMockAssociado({ id: '2' })
      store.associados = [associado1, associado2]

      mockApi.onDelete('/api/v1/associados/1').reply(204)

      // Act
      await store.deleteAssociado('1')

      // Assert
      expect(store.associados).toHaveLength(1)
      expect(store.associados[0].id).toBe('2')
      expect(store.error).toBeNull()
    })

    it('deve tratar erro ao deletar associado', async () => {
      // Arrange
      mockApi.onDelete('/api/v1/associados/999').reply(404, {
        message: 'Associado não encontrado'
      })

      // Act & Assert
      await expect(store.deleteAssociado('999')).rejects.toThrow()
      expect(store.error).toBeTruthy()
    })
  })

  describe('selectAssociado', () => {
    it('deve selecionar um associado', () => {
      // Arrange
      const associado = createMockAssociado()

      // Act
      store.selectAssociado(associado)

      // Assert
      expect(store.selectedAssociado).toEqual(associado)
    })

    it('deve limpar seleção quando null', () => {
      // Arrange
      store.selectedAssociado = createMockAssociado()

      // Act
      store.selectAssociado(null)

      // Assert
      expect(store.selectedAssociado).toBeNull()
    })
  })
})
