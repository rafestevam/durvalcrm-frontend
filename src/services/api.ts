import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiError } from './types'
import authService from './auth'
import router from '@/router'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor para adicionar token do Keycloak
    this.api.interceptors.request.use(
      async (config) => {
        // Tenta atualizar o token se estiver próximo do vencimento
        if (authService.isAuthenticated()) {
          try {
            await authService.updateToken(30)
            const token = authService.getToken()
            if (token) {
              config.headers.Authorization = `Bearer ${token}`
            }
          } catch (error) {
            console.error('Erro ao atualizar token:', error)
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor para tratamento de erros
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          try {
            // Tenta renovar o token uma vez
            const refreshed = await authService.updateToken(0)
            if (refreshed) {
              // Retry da requisição original com o novo token
              const originalRequest = error.config
              const token = authService.getToken()
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return this.api.request(originalRequest)
              }
            }
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError)
          }
          
          // Se não conseguiu renovar, redireciona para login
          await authService.logout()
          router.push('/login')
        }
        
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'Erro interno do servidor',
          status: error.response?.status || 500,
          errors: error.response?.data?.errors
        }
        
        return Promise.reject(apiError)
      }
    )
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

export const apiService = new ApiService()
export default apiService