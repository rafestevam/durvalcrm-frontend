// src/services/auth.ts - Versão completa corrigida

import apiService from './api'

export interface LoginInfo {
  authServerUrl: string
  clientId: string
  realm: string
  loginUrl: string
}

export interface UserInfo {
  sub: string
  preferred_username: string
  email?: string
  name?: string
  given_name?: string
  family_name?: string
  username?: string
  subject?: string
  tokenExpiry?: number
  issuedAt?: number
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export class AuthService {
  async getLoginInfo(): Promise<LoginInfo> {
    return await apiService.get<LoginInfo>('/auth/login-info')
  }

  async getUserInfo(): Promise<UserInfo> {
    return await apiService.get<UserInfo>('/auth/user-info')
  }

  async validateToken(): Promise<{ valid: boolean; username?: string }> {
    return await apiService.get('/auth/validate')
  }

  async logout(): Promise<{ message: string; logoutUrl: string }> {
    return await apiService.get('/auth/logout')
  }

  // NOVO MÉTODO: refreshToken
  async refreshToken(): Promise<boolean> {
    try {
      const refreshTokenValue = this.getRefreshToken()
      if (!refreshTokenValue) {
        console.log('Nenhum refresh token disponível')
        return false
      }

      console.log('Renovando token...')
      
      // Fazer requisição para renovar token
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshTokenValue
        })
      })

      if (!response.ok) {
        console.error('Erro ao renovar token:', response.statusText)
        return false
      }

      const tokenData = await response.json()
      
      if (tokenData.access_token) {
        this.storeTokens(tokenData)
        console.log('Token renovado com sucesso')
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return false
    }
  }

  // Funções utilitárias para PKCE
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return this.base64URLEncode(array)
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return this.base64URLEncode(new Uint8Array(digest))
  }

  private base64URLEncode(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  // MÉTODO ATUALIZADO: redirectToLogin com suporte PKCE
  async redirectToLogin(): Promise<void> {
    try {
      console.log('Iniciando processo de login com PKCE...')
      
      const loginInfo = await this.getLoginInfo()
      console.log('Informações de login obtidas:', {
        authServerUrl: loginInfo.authServerUrl,
        clientId: loginInfo.clientId
      })
      
      // Gerar state e PKCE
      const state = this.generateState()
      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      
      // Salvar informações para o callback
      const redirectUri = `${window.location.origin}/auth/callback`
      sessionStorage.setItem('oauth_state', state)
      sessionStorage.setItem('oauth_redirect_uri', redirectUri)
      sessionStorage.setItem('oauth_client_id', loginInfo.clientId)
      sessionStorage.setItem('oauth_code_verifier', codeVerifier)
      
      // Construir URL de autorização
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: loginInfo.clientId,
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      })
      
      const authUrl = `${loginInfo.authServerUrl}/protocol/openid-connect/auth?${authParams.toString()}`
      
      console.log('Redirecionando para:', authUrl)
      window.location.href = authUrl
      
    } catch (error) {
      console.error('Erro ao iniciar login:', error)
      throw error
    }
  }

  // MÉTODO ATUALIZADO: handleCallback com melhor tratamento de estado
  async handleCallback(code: string, _redirectUri: string): Promise<TokenResponse> {
    try {
      console.log('Processando callback OAuth...')
      
      // Obter state da URL atual
      const urlParams = new URLSearchParams(window.location.search)
      const receivedState = urlParams.get('state')
      const storedState = sessionStorage.getItem('oauth_state')
      
      console.log('Validando state OAuth:', {
        receivedState: receivedState ? receivedState.substring(0, 8) + '...' : null,
        storedState: storedState ? storedState.substring(0, 8) + '...' : null
      })
      
      // Validar state para prevenir CSRF
      if (!storedState || !receivedState || storedState !== receivedState) {
        console.error('Estado OAuth inválido:', { storedState, receivedState })
        throw new Error('Estado OAuth inválido - possível ataque CSRF')
      }
      
      // Obter dados salvos do sessionStorage
      const savedRedirectUri = sessionStorage.getItem('oauth_redirect_uri')
      const clientId = sessionStorage.getItem('oauth_client_id')
      const codeVerifier = sessionStorage.getItem('oauth_code_verifier')
      
      if (!savedRedirectUri || !clientId || !codeVerifier) {
        console.error('Dados OAuth incompletos:', { savedRedirectUri, clientId, codeVerifier: !!codeVerifier })
        throw new Error('Dados OAuth incompletos no sessionStorage')
      }
      
      // Preparar dados para trocar código por token
      const callbackData = {
        code,
        redirectUri: savedRedirectUri, // Usar o redirectUri salvo no sessionStorage
        codeVerifier
      }
      
      console.log('Trocando código por token...', {
        code: code.substring(0, 10) + '...',
        redirectUri: savedRedirectUri,
        codeVerifier: codeVerifier.substring(0, 8) + '...'
      })
      
      const responseData = await apiService.post<TokenResponse>('/auth/callback', callbackData)
      
      if (!responseData?.access_token) {
        throw new Error('Token não recebido na resposta')
      }
      
      console.log('Token obtido com sucesso')
      
      // Armazenar tokens
      this.storeTokens(responseData)
      
      // Limpar dados temporários
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_redirect_uri')
      sessionStorage.removeItem('oauth_client_id')
      sessionStorage.removeItem('oauth_code_verifier')
      
      return responseData
      
    } catch (error) {
      console.error('Erro ao trocar código por token:', error)
      throw error
    }
  }

  // MÉTODO CORRIGIDO: storeTokens com melhor sincronização
  private storeTokens(tokenResponse: TokenResponse): void {
    try {
      console.log('Armazenando tokens...')
      
      // Calcular tempo de expiração
      const expiresIn = tokenResponse.expires_in || 3600 // Default 1 hora
      const expiresAt = Date.now() + (expiresIn * 1000)
      
      // Armazenar tokens de forma síncrona
      localStorage.setItem('access_token', tokenResponse.access_token)
      localStorage.setItem('token_expires_at', expiresAt.toString())
      
      if (tokenResponse.refresh_token) {
        localStorage.setItem('refresh_token', tokenResponse.refresh_token)
      }
      
      console.log('Tokens armazenados com sucesso:', {
        expires_in: expiresIn,
        expires_at: new Date(expiresAt).toISOString(),
        has_refresh_token: !!tokenResponse.refresh_token
      })
      
    } catch (error) {
      console.error('Erro ao armazenar tokens:', error)
      throw new Error('Falha ao armazenar tokens de autenticação')
    }
  }

  private generateState(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return this.base64URLEncode(array)
  }

  // Métodos públicos necessários para o store e api.ts
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return true
    
    return Date.now() >= parseInt(expiresAt)
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

  clearTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_info')
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_redirect_uri')
    sessionStorage.removeItem('oauth_client_id')
    sessionStorage.removeItem('oauth_code_verifier')
  }

  // NOVO MÉTODO: para debug e diagnóstico
  getAuthDebugInfo(): Record<string, any> {
    return {
      hasToken: !!this.getStoredToken(),
      hasUserInfo: !!this.getStoredUserInfo(),
      tokenExpiringSoon: this.isTokenExpiringSoon(),
      tokenExpiresAt: localStorage.getItem('token_expires_at'),
      oauthState: sessionStorage.getItem('oauth_state'),
      oauthRedirectUri: sessionStorage.getItem('oauth_redirect_uri'),
      currentUrl: window.location.href,
      currentOrigin: window.location.origin
    }
  }

  // NOVO MÉTODO: limpar completamente o estado de autenticação
  clearAllAuthData(): void {
    this.clearTokens()
    console.log('Todos os dados de autenticação foram limpos')
  }
}

const authService = new AuthService()
export default authService