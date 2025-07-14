// src/services/api.ts - Versão corrigida

import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api'

export class ApiService {
  private api: AxiosInstance
  private baseURL: string
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []

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
          
          // CORREÇÃO: Verificar se é endpoint de validação - não tentar refresh
          if (originalRequest.url?.includes('/auth/validate')) {
            console.log('Erro 401 no endpoint de validação - token provavelmente inválido')
            return Promise.reject(error)
          }

          // CORREÇÃO: Verificar se é callback - não tentar refresh  
          if (originalRequest.url?.includes('/auth/callback')) {
            console.log('Erro 401 no callback - não fazer refresh')
            return Promise.reject(error)
          }

          // Se já está fazendo refresh, enfileirar requisição
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(() => {
              const newToken = localStorage.getItem('access_token')
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return this.api(originalRequest)
              }
              return Promise.reject(error)
            }).catch(err => {
              return Promise.reject(err)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            // Verificar se temos refresh token
            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
              // Tentar renovar token
              const success = await this.refreshAccessToken(refreshToken)
              if (success) {
                // Processar fila de requisições falhadas
                this.processQueue(null)
                
                // Retry da requisição original com novo token
                const newToken = localStorage.getItem('access_token')
                if (newToken) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`
                  return this.api(originalRequest)
                }
              }
            }
            
            // Se não conseguiu renovar, limpar tokens e processar fila
            this.processQueue(error)
            this.clearTokensAndRedirect()
            
          } catch (refreshError) {
            console.error('Erro ao renovar token:', refreshError)
            this.processQueue(refreshError)
            this.clearTokensAndRedirect()
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // CORREÇÃO: Método para processar fila de requisições
  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
    
    this.failedQueue = []
  }

  // Método para tentar renovar o access token - CORRIGIDO
private async refreshAccessToken(refreshToken: string): Promise<boolean> {
  try {
    console.log('Tentando renovar access token...')
    
    // CORREÇÃO: Enviar como application/x-www-form-urlencoded
    const formData = new URLSearchParams()
    formData.append('refresh_token', refreshToken)
    
    const response = await axios.post(`${this.baseURL}/auth/refresh`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'  // ✅ Content-Type correto
      },
      timeout: 5000 // Timeout menor para refresh
    })

    if (response.data?.access_token) {
      // Armazenar novo token
      localStorage.setItem('access_token', response.data.access_token)
      
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
      
      // Calcular nova expiração
      const expiresIn = response.data.expires_in || 3600
      const expiresAt = Date.now() + (expiresIn * 1000)
      localStorage.setItem('token_expires_at', expiresAt.toString())
      
      console.log('Token renovado com sucesso')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Erro ao renovar token:', error)
    return false
  }
}

  // Limpar tokens e redirecionar para login
  private clearTokensAndRedirect(): void {
    console.log('Limpando tokens e redirecionando para login...')
    
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_info')
    
    // CORREÇÃO: Não redirecionar imediatamente se estivermos no callback
    if (!window.location.pathname.includes('/auth/callback')) {
      // Redirecionar para login após um pequeno delay
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }
  }

  // Métodos HTTP públicos
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config)
    return response.data
  }

  // Método para fazer requisições sem interceptors (útil para debugging)
  async rawRequest<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await axios.request<T>({
      ...config,
      baseURL: this.baseURL
    })
    return response.data
  }

  // Método para obter instância do axios (para casos especiais)
  getAxiosInstance(): AxiosInstance {
    return this.api
  }

  // Método para configurar token manualmente
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Método para remover token
  removeAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization']
  }

  // NOVO: Método para verificar se uma URL deve ser ignorada pelos interceptors
  private shouldIgnoreAuth(url: string): boolean {
    const ignoredEndpoints = [
      '/auth/login-info',
      '/auth/callback'
    ]
    
    return ignoredEndpoints.some(endpoint => url.includes(endpoint))
  }
}

// Instância singleton
const apiService = new ApiService()
export default apiService