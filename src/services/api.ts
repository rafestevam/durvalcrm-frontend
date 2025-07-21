import axios, { AxiosError } from 'axios'
import type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse,
  InternalAxiosRequestConfig 
} from 'axios'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/auth'
import { APP_CONFIG } from '@/utils/constants'

// Configuração base do axios para todas as requisições
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api',
  timeout: APP_CONFIG.API.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição para adicionar o token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obter token diretamente do localStorage
    const token = localStorage.getItem('access_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data
      })
    }
    
    return config
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor de resposta para tratar erros e renovar tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log da resposta em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      })
    }
    
    return response
  },
  async (error: AxiosError) => {
    const authStore = useAuthStore()
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Log do erro em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response?.data,
        message: error.message
      })
    }

    // Se o token expirou (401) e ainda não tentamos renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        console.log('Token expirado, tentando renovar...')
        
        // Usar método do authService para renovar token
        const refreshSuccess = await authService.refreshToken()
        
        if (refreshSuccess) {
          // Reenviar a requisição original com o novo token
          const newToken = authService.getAccessToken()
          if (originalRequest && newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          }
        }
        
        // Se não conseguiu renovar, fazer logout
        await authStore.logout()
        return Promise.reject(error)
        
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError)
        await authStore.logout()
        return Promise.reject(error)
      }
    }

    // Processar outros tipos de erro
    const processedError = processApiError(error)
    return Promise.reject(processedError)
  }
)

// Função para processar e padronizar erros da API
function processApiError(error: AxiosError): AxiosError {
  const response = error.response
  
  if (!response) {
    // Erro de rede
    error.message = 'Erro de conexão. Verifique sua internet.'
    error.code = 'NETWORK_ERROR'
    return error
  }

  // Extrair mensagem de erro do backend
  const backendMessage = (response.data as any)?.error || 
                        (response.data as any)?.message || 
                        response.statusText

  switch (response.status) {
    case 400:
      error.message = backendMessage || 'Dados inválidos'
      break
    case 401:
      error.message = 'Não autorizado. Faça login novamente.'
      break
    case 403:
      error.message = 'Acesso negado'
      break
    case 404:
      error.message = 'Recurso não encontrado'
      break
    case 409:
      error.message = backendMessage || 'Conflito de dados'
      break
    case 422:
      error.message = backendMessage || 'Dados inválidos'
      break
    case 500:
      error.message = 'Erro interno do servidor'
      break
    case 503:
      error.message = 'Serviço temporariamente indisponível'
      break
    default:
      error.message = backendMessage || 'Erro desconhecido'
  }

  return error
}

// Interface para opções de requisição customizada
interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  retries?: number
}

// Serviço principal da API
const apiService = {
  // GET
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await apiClient.get<T>(url, config)
      return response.data
    } catch (error) {
      console.error(`Erro GET ${url}:`, error)
      throw error
    }
  },

  // POST
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const response = await apiClient.post<T>(url, data, config)
      return response.data
    } catch (error) {
      console.error(`Erro POST ${url}:`, error)
      throw error
    }
  },

  // PUT
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const response = await apiClient.put<T>(url, data, config)
      return response.data
    } catch (error) {
      console.error(`Erro PUT ${url}:`, error)
      throw error
    }
  },

  // PATCH
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    try {
      const response = await apiClient.patch<T>(url, data, config)
      return response.data
    } catch (error) {
      console.error(`Erro PATCH ${url}:`, error)
      throw error
    }
  },

  // DELETE
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await apiClient.delete<T>(url, config)
      return response.data
    } catch (error) {
      console.error(`Erro DELETE ${url}:`, error)
      throw error
    }
  },

  // Upload de arquivo
  async upload<T = any>(url: string, file: File, config?: RequestConfig): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post<T>(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error(`Erro UPLOAD ${url}:`, error)
      throw error
    }
  },

  // Download de arquivo
  async download(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    try {
      const response = await apiClient.get(url, {
        ...config,
        responseType: 'blob',
      })

      // Criar URL temporária para download
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      
      // Criar elemento de link temporário para forçar download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      
      // Limpar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error(`Erro DOWNLOAD ${url}:`, error)
      throw error
    }
  },

  // Verificar conectividade
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { timeout: 5000 })
      return true
    } catch {
      return false
    }
  },

  // Obter instância do axios para uso avançado
  getInstance(): AxiosInstance {
    return apiClient
  }
}

export default apiService