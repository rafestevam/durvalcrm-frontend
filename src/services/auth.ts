import apiService from './api'
import type { Usuario } from './types'

export interface LoginInfo {
  authServerUrl: string
  clientId: string
  realm: string
  loginUrl: string
}

export interface UserInfo extends Usuario {
  subject: string
  tokenExpiry: number
  issuedAt: number
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
      const loginUrl = `${loginInfo.authServerUrl}/protocol/openid-connect/auth?client_id=${loginInfo.clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=${redirectUri}`
      window.location.href = loginUrl
    })
  }

  async handleCallback(code: string): Promise<boolean> {
    try {
      // Em uma implementação real, você enviaria o código para seu backend
      // para trocar por tokens. Por enquanto, simulamos sucesso.
      console.log('Código de autorização recebido:', code)
      return true
    } catch (error) {
      console.error('Erro no callback de autenticação:', error)
      return false
    }
  }
}

export const authService = new AuthService()
