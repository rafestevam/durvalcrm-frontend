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

  // MÉTODO ATUALIZADO: redirectToLogin com melhor tratamento de erros e debug
  async redirectToLogin(): Promise<void> {
    try {
      console.log('Iniciando processo de login...')
      
      const loginInfo = await this.getLoginInfo()
      console.log('Informações de login obtidas:', {
        authServerUrl: loginInfo.authServerUrl,
        clientId: loginInfo.clientId,
        realm: loginInfo.realm
      })
      
      // Usar a URL atual da aplicação como base
      const currentOrigin = window.location.origin
      const redirectUri = `${currentOrigin}/auth/callback`
      const state = this.generateState()
      
      // Salvar state e outras informações no sessionStorage para validação posterior
      sessionStorage.setItem('oauth_state', state)
      sessionStorage.setItem('oauth_redirect_uri', redirectUri)
      sessionStorage.setItem('oauth_client_id', loginInfo.clientId)
      
      // Construir URL de login com todos os parâmetros necessários
      const params = new URLSearchParams({
        client_id: loginInfo.clientId,
        response_type: 'code',
        scope: 'openid profile email',
        redirect_uri: redirectUri,
        state: state,
        // Parâmetros adicionais para garantir compatibilidade
        response_mode: 'query'
      })
      
      const loginUrl = `${loginInfo.authServerUrl}/protocol/openid-connect/auth?${params.toString()}`
      
      console.log('Redirecionando para login:', {
        url: loginUrl,
        redirectUri: redirectUri,
        clientId: loginInfo.clientId,
        state: state.substring(0, 8) + '...'
      })
      
      window.location.href = loginUrl
      
    } catch (error) {
      console.error('Erro ao obter informações de login:', error)
      throw new Error('Falha ao iniciar processo de login')
    }
  }

  // MÉTODO ATUALIZADO: handleCallback com melhor tratamento de erros
  async handleCallback(code: string, redirectUri: string): Promise<boolean> {
    try {
      console.log('Iniciando processamento do callback OAuth2...')
      
      // Verificar se o código está presente
      if (!code || code.trim() === '') {
        throw new Error('Código de autorização ausente ou vazio')
      }
      
      // Validar state
      const urlParams = new URLSearchParams(window.location.search)
      const receivedState = urlParams.get('state')
      const savedState = sessionStorage.getItem('oauth_state')
      
      console.log('Validando state OAuth:', {
        receivedState: receivedState ? receivedState.substring(0, 8) + '...' : 'ausente',
        savedState: savedState ? savedState.substring(0, 8) + '...' : 'ausente'
      })
      
      if (savedState && receivedState !== savedState) {
        throw new Error('Estado OAuth inválido - possível ataque CSRF')
      }
      
      // Usar redirect URI armazenado se disponível, caso contrário usar o fornecido
      const storedRedirectUri = sessionStorage.getItem('oauth_redirect_uri')
      const finalRedirectUri = storedRedirectUri || redirectUri
      
      console.log('Usando redirect URI:', finalRedirectUri)
      
      // Enviar código para o backend trocar por token
      const tokenResponse = await this.exchangeCodeForToken(code, finalRedirectUri)
      
      if (!tokenResponse.access_token) {
        throw new Error('Token de acesso não recebido')
      }
      
      // Armazenar tokens
      this.storeTokens(tokenResponse)
      
      // Buscar informações do usuário
      await this.fetchAndStoreUserInfo(tokenResponse.access_token)
      
      // Limpar dados temporários do OAuth
      this.clearOAuthSessionData()
      
      console.log('Callback processado com sucesso')
      return true
      
    } catch (error) {
      console.error('Erro no processamento do callback:', error)
      this.clearStoredTokens()
      this.clearOAuthSessionData()
      throw error // Re-throw para que o componente possa tratar o erro
    }
  }

  // MÉTODO ATUALIZADO: exchangeCodeForToken com melhor tratamento de erros
  private async exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResponse> {
    try {
      const payload = {
        code,
        redirectUri
      }
      
      console.log('Trocando código por token...', { 
        code: code.substring(0, 10) + '...',
        redirectUri 
      })
      
      const response = await fetch(`${apiService.getBaseUrl()}/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      console.log('Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      // Tentar ler o corpo da resposta como JSON, mesmo em caso de erro
      let responseData: any
      try {
        responseData = await response.json()
      } catch (jsonError) {
        console.error('Erro ao parsear resposta JSON:', jsonError)
        responseData = { error: 'invalid_response', error_description: 'Resposta inválida do servidor' }
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
      console.error('Erro na troca código->token:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Falha na obtenção do token: ${error}`)
    }
  }

  // MÉTODO ATUALIZADO: storeTokens com logs melhorados
  private storeTokens(tokenResponse: TokenResponse): void {
    try {
      localStorage.setItem('access_token', tokenResponse.access_token)
      
      if (tokenResponse.refresh_token) {
        localStorage.setItem('refresh_token', tokenResponse.refresh_token)
      }
      
      // Calcular e armazenar data de expiração
      const expiresAt = Date.now() + (tokenResponse.expires_in * 1000)
      localStorage.setItem('token_expires_at', expiresAt.toString())
      
      console.log('Tokens armazenados com sucesso:', {
        expires_in: tokenResponse.expires_in,
        expires_at: new Date(expiresAt).toISOString(),
        has_refresh_token: !!tokenResponse.refresh_token
      })
    } catch (error) {
      console.error('Erro ao armazenar tokens:', error)
      throw new Error('Falha ao armazenar tokens de autenticação')
    }
  }

  // MÉTODO ATUALIZADO: fetchAndStoreUserInfo com melhor tratamento de erros
  private async fetchAndStoreUserInfo(accessToken: string): Promise<void> {
    try {
      console.log('Buscando informações do usuário...')
      
      // Configurar token no cabeçalho temporariamente
      localStorage.setItem('access_token', accessToken)
      
      const userInfo = await this.getUserInfo()
      localStorage.setItem('user_info', JSON.stringify(userInfo))
      
      console.log('Informações do usuário armazenadas:', {
        username: userInfo.username,
        subject: userInfo.subject,
        email: userInfo.email
      })
      
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error)
      throw new Error('Falha ao buscar dados do usuário')
    }
  }

  // NOVO MÉTODO: clearOAuthSessionData
  private clearOAuthSessionData(): void {
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_redirect_uri')
    sessionStorage.removeItem('oauth_client_id')
  }

  // MÉTODO ATUALIZADO: clearStoredTokens
  private clearStoredTokens(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_info')
    this.clearOAuthSessionData()
  }

  // MÉTODO MELHORADO: generateState
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
    this.clearStoredTokens()
    console.log('Todos os dados de autenticação foram limpos')
  }
}

// Exportação da instância como default
const authService = new AuthService()
export default authService

// Exportação nomeada para compatibilidade
export { authService }