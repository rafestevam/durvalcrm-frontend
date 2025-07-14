import apiService from './api'
import type { User } from './types'

export interface LoginInfo {
  authServerUrl: string
  clientId: string
  realm: string
  loginUrl: string
}

export interface UserInfo extends User {
  subject: string
  tokenExpiry: number
  issuedAt: number
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export class AuthService {
  async getLoginInfo(): Promise<LoginInfo> {
    return apiService.get<LoginInfo>('/auth/login-info')
  }

  async getUserInfo(): Promise<UserInfo> {
    return apiService.get<UserInfo>('/auth/me')
  }

  async validateToken(): Promise<{ valid: boolean; username?: string }> {
    return apiService.get('/auth/validate')
  }

  async logout(): Promise<{ message: string; logoutUrl: string }> {
    return apiService.get('/auth/logout')
  }

  redirectToLogin(): void {
    this.getLoginInfo().then((loginInfo) => {
      const redirectUri = encodeURIComponent(window.location.origin + '/auth/callback')
      const state = this.generateState()
      
      // Salvar state no sessionStorage para validação posterior
      sessionStorage.setItem('oauth_state', state)
      
      const loginUrl = `${loginInfo.authServerUrl}/protocol/openid-connect/auth?client_id=${loginInfo.clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=${redirectUri}&state=${state}`
      
      console.log('Redirecionando para:', loginUrl)
      window.location.href = loginUrl
    }).catch((error) => {
      console.error('Erro ao obter informações de login:', error)
    })
  }

  async handleCallback(code: string, redirectUri: string): Promise<boolean> {
    try {
      console.log('Iniciando processamento do callback OAuth2...')
      
      // Validar state (se presente)
      const urlParams = new URLSearchParams(window.location.search)
      const receivedState = urlParams.get('state')
      const savedState = sessionStorage.getItem('oauth_state')
      
      if (savedState && receivedState !== savedState) {
        throw new Error('Estado OAuth inválido - possível ataque CSRF')
      }
      
      // Limpar state do sessionStorage
      sessionStorage.removeItem('oauth_state')
      
      // Enviar código para o backend trocar por token
      const tokenResponse = await this.exchangeCodeForToken(code, redirectUri)
      
      if (!tokenResponse.access_token) {
        throw new Error('Token de acesso não recebido')
      }
      
      // Armazenar tokens
      this.storeTokens(tokenResponse)
      
      // Buscar informações do usuário
      await this.fetchAndStoreUserInfo(tokenResponse.access_token)
      
      console.log('Callback processado com sucesso')
      return true
      
    } catch (error) {
      console.error('Erro no processamento do callback:', error)
      this.clearStoredTokens()
      return false
    }
  }

  private async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      const payload = {
        code,
        redirectUri
      }
      
      console.log('Trocando código por token...', { code: code.substring(0, 10) + '...' })
      
      const response = await fetch(`${apiService.getBaseUrl()}/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const tokenData = await response.json()
      console.log('Token recebido com sucesso')
      
      return tokenData
      
    } catch (error) {
      console.error('Erro na troca código->token:', error)
      throw new Error(`Falha na obtenção do token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  private storeTokens(tokenResponse: TokenResponse): void {
    localStorage.setItem('access_token', tokenResponse.access_token)
    
    if (tokenResponse.refresh_token) {
      localStorage.setItem('refresh_token', tokenResponse.refresh_token)
    }
    
    // Calcular e armazenar data de expiração
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000)
    localStorage.setItem('token_expires_at', expiresAt.toString())
    
    console.log('Tokens armazenados com sucesso')
  }

  private async fetchAndStoreUserInfo(accessToken: string): Promise<void> {
    try {
      // Configurar token no cabeçalho temporariamente
      const originalToken = localStorage.getItem('access_token')
      localStorage.setItem('access_token', accessToken)
      
      const userInfo = await this.getUserInfo()
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      
      console.log('Informações do usuário armazenadas:', userInfo.username)
      
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error)
      throw new Error('Falha ao buscar dados do usuário')
    }
  }

  private clearStoredTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_info')
    sessionStorage.removeItem('oauth_state')
  }

  private generateState(): string {
    // Gerar string aleatória para proteção CSRF
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Método para verificar se o token está próximo da expiração
  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return true
    
    const expirationTime = parseInt(expiresAt)
    const thresholdTime = Date.now() + (thresholdMinutes * 60 * 1000)
    
    return expirationTime <= thresholdTime
  }

  // Método para obter token armazenado
  getStoredToken(): string | null {
    return localStorage.getItem('access_token')
  }

  // Método para obter informações do usuário armazenadas
  getStoredUserInfo(): UserInfo | null {
    const userInfoStr = localStorage.getItem('user_info')
    if (!userInfoStr) return null
    
    try {
      return JSON.parse(userInfoStr)
    } catch {
      return null
    }
  }
}

// Exportação da instância como default
const authService = new AuthService()
export default authService

// Exportação nomeada para compatibilidade
export { authService }