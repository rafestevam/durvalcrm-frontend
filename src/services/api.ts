import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api'

export class ApiService {
  private api: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        // Adicionar token se disponível
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor para tratamento de erros
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config

        // Se token expirou (401) e não é uma tentativa de refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Verificar se temos refresh token
            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
              // Tentar renovar token
              const success = await this.refreshAccessToken(refreshToken)
              if (success) {
                // Retry da requisição original com novo token
                const newToken = localStorage.getItem('access_token')
                if (newToken) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`
                  return this.api(originalRequest)
                }
              }
            }
            
            // Se não conseguiu renovar, limpar tokens e redirecionar
            this.clearTokensAndRedirect()
            
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError)
            this.clearTokensAndRedirect()
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshAccessToken(refreshToken: string): Promise<boolean> {
    try {
      // Implementar refresh token se o Keycloak/backend suportar
      // Por enquanto, vamos apenas validar o token atual
      const response = await fetch(`${this.baseURL}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      
      return response.ok
      
    } catch (error) {
      console.error('Erro na validação do token:', error)
      return false
    }
  }

  private clearTokensAndRedirect(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_info')
    
    // Redirecionar para login apenas se não estivermos já na página de login
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth/callback')) {
      window.location.href = '/login'
    }
  }

  // Método público para obter a base URL
  getBaseUrl(): string {
    return this.baseURL
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }
}

// Exportação da instância como default
const apiService = new ApiService()
export default apiService

// Exportação nomeada para compatibilidade
export { apiService }