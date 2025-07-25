import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import apiService from '../api'

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock das stores Pinia
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    logout: vi.fn()
  }))
}))

// Mock do authService
vi.mock('@/services/auth', () => ({
  default: {
    refreshToken: vi.fn(),
    getAccessToken: vi.fn()
  }
}))

// Mock das constantes
vi.mock('@/utils/constants', () => ({
  APP_CONFIG: {
    API: {
      TIMEOUT_MS: 10000
    }
  }
}))

describe('apiService', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(apiService.getInstance())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('HTTP Methods', () => {
    it('performs GET request successfully', async () => {
      const testData = { id: 1, name: 'Test' }
      mock.onGet('/test').reply(200, testData)

      const result = await apiService.get('/test')
      expect(result).toEqual(testData)
    })

    it('performs POST request successfully', async () => {
      const testData = { id: 1, name: 'Test' }
      const requestData = { name: 'Test' }
      mock.onPost('/test', requestData).reply(201, testData)

      const result = await apiService.post('/test', requestData)
      expect(result).toEqual(testData)
    })

    it('performs PUT request successfully', async () => {
      const testData = { id: 1, name: 'Updated Test' }
      const requestData = { name: 'Updated Test' }
      mock.onPut('/test/1', requestData).reply(200, testData)

      const result = await apiService.put('/test/1', requestData)
      expect(result).toEqual(testData)
    })

    it('performs PATCH request successfully', async () => {
      const testData = { id: 1, name: 'Patched Test' }
      const requestData = { name: 'Patched Test' }
      mock.onPatch('/test/1', requestData).reply(200, testData)

      const result = await apiService.patch('/test/1', requestData)
      expect(result).toEqual(testData)
    })

    it('performs DELETE request successfully', async () => {
      mock.onDelete('/test/1').reply(204)

      const result = await apiService.delete('/test/1')
      expect(result).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('handles 400 Bad Request', async () => {
      mock.onGet('/test').reply(400, { message: 'Bad Request' })

      await expect(apiService.get('/test')).rejects.toThrow('Bad Request')
    })

    it('handles 401 Unauthorized', async () => {
      mock.onGet('/test').reply(401, { message: 'Unauthorized' })

      await expect(apiService.get('/test')).rejects.toThrow()
    })

    it('handles 404 Not Found', async () => {
      mock.onGet('/test').reply(404)

      await expect(apiService.get('/test')).rejects.toThrow('Recurso não encontrado')
    })

    it('handles 500 Internal Server Error', async () => {
      mock.onGet('/test').reply(500)

      await expect(apiService.get('/test')).rejects.toThrow('Erro interno do servidor')
    })

    it('handles network errors', async () => {
      mock.onGet('/test').networkError()

      await expect(apiService.get('/test')).rejects.toThrow('Erro de conexão')
    })
  })

  describe('Authentication', () => {
    it('adds Authorization header when token exists', async () => {
      localStorageMock.setItem('access_token', 'test-token')
      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBe('Bearer test-token')
        return [200, { success: true }]
      })

      await apiService.get('/test')
    })

    it('works without token when not present', async () => {
      mock.onGet('/test').reply((config) => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { success: true }]
      })

      await apiService.get('/test')
    })
  })

  describe('Health Check', () => {
    it('returns true when health endpoint is accessible', async () => {
      mock.onGet('/health').reply(200, { status: 'UP' })

      const result = await apiService.healthCheck()
      expect(result).toBe(true)
    })

    it('returns false when health endpoint fails', async () => {
      mock.onGet('/health').reply(500)

      const result = await apiService.healthCheck()
      expect(result).toBe(false)
    })

    it('returns false on network error', async () => {
      mock.onGet('/health').networkError()

      const result = await apiService.healthCheck()
      expect(result).toBe(false)
    })
  })

  describe('File Upload', () => {
    it('uploads file with correct form data', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const responseData = { success: true, fileId: '123' }
      
      mock.onPost('/upload').reply((config) => {
        expect(config.data).toBeInstanceOf(FormData)
        expect(config.headers?.['Content-Type']).toBe('multipart/form-data')
        return [200, responseData]
      })

      const result = await apiService.upload('/upload', file)
      expect(result).toEqual(responseData)
    })
  })

  describe('File Download', () => {
    it('downloads file and triggers browser download', async () => {
      const mockCreateElement = vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
      }))
      const mockAppendChild = vi.fn()
      const mockRemoveChild = vi.fn()
      const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
      const mockRevokeObjectURL = vi.fn()

      Object.defineProperty(document, 'createElement', {
        value: mockCreateElement,
        writable: true
      })
      Object.defineProperty(document.body, 'appendChild', {
        value: mockAppendChild,
        writable: true
      })
      Object.defineProperty(document.body, 'removeChild', {
        value: mockRemoveChild,
        writable: true
      })
      Object.defineProperty(window.URL, 'createObjectURL', {
        value: mockCreateObjectURL,
        writable: true
      })
      Object.defineProperty(window.URL, 'revokeObjectURL', {
        value: mockRevokeObjectURL,
        writable: true
      })

      const fileContent = 'test file content'
      mock.onGet('/download').reply(200, fileContent)

      await apiService.download('/download', 'test-file.txt')

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockAppendChild).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalled()
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
    })
  })
})