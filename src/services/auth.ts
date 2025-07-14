// src/services/auth.ts - Versão corrigida

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
    return apiService.get<LoginInfo>('/auth/login-info')
  }

  async getUserInfo(): Promise<UserInfo> {
    return apiService.get<UserInfo>('/auth/user-info')
  }

  async validateToken(): Promise<{ valid: boolean; username?: string }> {
    return apiService.get('/auth/validate')
  }

  async logout(): Promise<{ message: string; logoutUrl: string }> {
    return apiService.get('/auth/logout')
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
        clientId: loginInfo.clientId,
        realm: loginInfo.realm
      })
      
      // Gerar PKCE parameters
      const codeVerifier = this.generateCodeVerifier()
      const codeChallenge = await this.generateCodeChallenge(codeVerifier)
      const state = this.generateState()
      
      // Armazenar dados da sessão OAuth
      const redirectUri = `${window.location.origin}/auth/callback`
      
      sessionStorage.setItem('oauth_state', state)
      sessionStorage.setItem('oauth_redirect_uri', redirectUri)
      sessionStorage.setItem('oauth_client_id', loginInfo.clientId)
      sessionStorage.setItem('oauth_code_verifier', codeVerifier)
      
      console.log('Parâmetros PKCE gerados:', {
        codeVerifier: codeVerifier.substring(0, 8) + '...',
        codeChallenge: codeChallenge.substring(0, 8) + '...',
        state: state.substring(0, 8) + '...',
        redirectUri
      })
      
      // Construir URL de autorização
      const authUrl = new URL(`${loginInfo.authServerUrl}/protocol/openid-connect/auth`)
      authUrl.searchParams.set('client_id', loginInfo.clientId)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', 'openid profile email')
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('code_challenge', codeChallenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')
      
      console.log('Redirecionando para:', authUrl.toString())
      
      // Redirecionar para o Keycloak
      window.location.href = authUrl.toString()
      
    } catch (error) {
      console.error('Erro no processo de login:', error)
      throw new Error('Falha ao iniciar processo de autenticação')
    }
  }

  // MÉTODO CORRIGIDO: handleCallback com melhor sequenciamento
  async handleCallback(code: string, redirectUri: string): Promise<boolean> {
    try {
      console.log('Iniciando processamento do callback OAuth2 com PKCE...')
      
      // Validar state para prevenir CSRF
      const urlParams = new URLSearchParams(window.location.search)
      const receivedState = urlParams.get('state')
      const savedState = sessionStorage.getItem('oauth_state')
      
      console.log('Validando state OAuth:', {
        receivedState: receivedState ? receivedState.substring(0, 8) + '...' : null,
        savedState: savedState ? savedState.substring(0, 8) + '...' : null
      })
      
      if (!receivedState || !savedState || receivedState !== savedState) {
        throw new Error('State inválido - possível ataque CSRF')
      }
      
      // Recuperar code_verifier para PKCE
      const codeVerifier = sessionStorage.getItem('oauth_code_verifier')
      if (!codeVerifier) {
        throw new Error('Code verifier não encontrado - erro no fluxo PKCE')
      }
      
      console.log('Code verifier recuperado:', codeVerifier.substring(0, 8) + '...')
      
      // Trocar código por token
      const tokenResponse = await this.exchangeCodeForToken(code, redirectUri, codeVerifier)
      
      // CORREÇÃO: Armazenar tokens ANTES de qualquer validação
      this.storeTokens(tokenResponse)
      
      // CORREÇÃO: Aguardar um pouco para garantir que o token seja propagado
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Limpar dados temporários
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_redirect_uri')
      sessionStorage.removeItem('oauth_client_id')
      sessionStorage.removeItem('oauth_code_verifier')
      
      console.log('Callback processado com sucesso!')
      return true
      
    } catch (error) {
      console.error('Erro no callback de autenticação:', error)
      
      // Limpar dados temporários em caso de erro
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_redirect_uri')
      sessionStorage.removeItem('oauth_client_id')
      sessionStorage.removeItem('oauth_code_verifier')
      
      throw error
    }
  }

  // MÉTODO CORRIGIDO: exchangeCodeForToken com melhor tratamento de resposta
  private async exchangeCodeForToken(code: string, redirectUri: string, codeVerifier: string): Promise<TokenResponse> {
    try {
      console.log('Trocando código por token com PKCE...')
      
      const requestData = {
        code: code,
        redirectUri: redirectUri,
        codeVerifier: codeVerifier
      }
      
      console.log('Dados da requisição token:', {
        code: code.substring(0, 10) + '...',
        redirectUri: redirectUri,
        codeVerifier: codeVerifier.substring(0, 8) + '...'
      })
      
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })
      
      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        throw new Error(`Resposta inválida do servidor: ${response.status} ${response.statusText}`)
      }
      
      if (!response.ok) {
        const errorMessage = responseData.error_description || responseData.error || `HTTP ${response.status}: ${response.statusText}`
        
        console.error('Erro na troca código->token:', {
          status: response.status,
          error: responseData.error,
          error_description: responseData.error_description,
          responseData
        })
        
        // Mapear erros comuns
        switch (responseData.error) {
          case 'invalid_request':
            throw new Error('Requisição inválida - verifique configuração do Keycloak')
          case 'invalid_client':
            throw new Error('Cliente inválido - verifique client ID e secret')
          case 'invalid_grant':
            throw new Error('Código de autorização inválido ou expirado')
          case 'unauthorized_client':
            throw new Error('Cliente não autorizado')
          default:
            throw new Error(errorMessage)
        }
      }
      
      if (!responseData.access_token) {
        throw new Error('Token de acesso não encontrado na resposta')
      }
      
      console.log('Token recebido com sucesso:', {
        token_type: responseData.token_type,
        expires_in: responseData.expires_in,
        has_refresh_token: !!responseData.refresh_token
      })
      
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

  // Métodos públicos necessários para o store
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