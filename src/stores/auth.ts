import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type UserInfo } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => {
    const hasToken = !!token.value
    const hasUser = !!user.value
    const tokenNotExpired = !authService.isTokenExpiringSoon()
    
    return hasToken && hasUser && tokenNotExpired
  })
  
  const username = computed(() => user.value?.username || '')

  // Actions
  async function login(authToken: string) {
    try {
      isLoading.value = true
      token.value = authToken
      localStorage.setItem('access_token', authToken)
      
      // Busca informações do usuário
      user.value = await authService.getUserInfo()
      localStorage.setItem('user_info', JSON.stringify(user.value))
      
      return true
    } catch (error) {
      console.error('Erro no login:', error)
      logout()
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      isLoading.value = true
      
      if (token.value) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      // Limpa estado local independente do resultado da API
      clearAuthState()
      isLoading.value = false
    }
  }

  async function validateSession(): Promise<boolean> {
    if (!token.value) {
      return false
    }

    try {
      // Verificar se o token está próximo da expiração
      if (authService.isTokenExpiringSoon()) {
        console.log('Token expirando em breve, fazendo logout preventivo')
        logout()
        return false
      }

      const validation = await authService.validateToken()
      if (!validation.valid) {
        logout()
        return false
      }
      
      // Se não temos dados do usuário, busca
      if (!user.value) {
        const storedUserInfo = authService.getStoredUserInfo()
        if (storedUserInfo) {
          user.value = storedUserInfo
        } else {
          user.value = await authService.getUserInfo()
          localStorage.setItem('user_info', JSON.stringify(user.value))
        }
      }
      
      return true
    } catch (error) {
      console.error('Erro na validação da sessão:', error)
      logout()
      return false
    }
  }

  function redirectToLogin() {
    authService.redirectToLogin()
  }

  function clearAuthState() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_info')
    sessionStorage.removeItem('oauth_state')
  }

  // Inicializar estado do store com dados armazenados
  function initializeFromStorage() {
    const storedToken = authService.getStoredToken()
    const storedUserInfo = authService.getStoredUserInfo()
    
    if (storedToken && storedUserInfo) {
      token.value = storedToken
      user.value = storedUserInfo
      
      // Validar sessão de forma assíncrona
      validateSession().catch(() => {
        console.log('Sessão armazenada inválida, limpando dados')
      })
    }
  }

  // Verificar periodicamente a validade do token
  function setupTokenValidation() {
    setInterval(() => {
      if (isAuthenticated.value && authService.isTokenExpiringSoon(2)) {
        console.log('Token expirando em 2 minutos, fazendo logout preventivo')
        logout()
      }
    }, 60000) // Verificar a cada minuto
  }

  return {
    // Estado
    user,
    token,
    isLoading,
    
    // Getters
    isAuthenticated,
    username,
    
    // Actions
    login,
    logout,
    validateSession,
    redirectToLogin,
    clearAuthState,
    initializeFromStorage,
    setupTokenValidation,
  }
})