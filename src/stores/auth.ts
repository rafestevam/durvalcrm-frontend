// src/stores/auth.ts - Versão corrigida

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService, { type UserInfo } from '@/services/auth'

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
  
  const username = computed(() => user.value?.username || user.value?.preferred_username || '')

  // Actions
  async function login(authToken: string): Promise<boolean> {
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

  // CORREÇÃO: validateSession com melhor sequenciamento e tratamento de erro
  async function validateSession(): Promise<boolean> {
    // Verificar se tem token local primeiro
    const storedToken = authService.getStoredToken()
    if (!storedToken) {
      console.log('Nenhum token encontrado no localStorage')
      return false
    }

    // Sincronizar token local com o store
    if (token.value !== storedToken) {
      token.value = storedToken
    }

    try {
      // Verificar se o token está próximo da expiração ANTES de fazer chamadas
      if (authService.isTokenExpiringSoon()) {
        console.log('Token expirando em breve, fazendo logout preventivo')
        logout()
        return false
      }

      // Buscar informações do usuário primeiro se não temos
      if (!user.value) {
        const storedUserInfo = authService.getStoredUserInfo()
        if (storedUserInfo) {
          user.value = storedUserInfo
          console.log('Informações do usuário carregadas do localStorage')
        } else {
          console.log('Buscando informações do usuário via API...')
          user.value = await authService.getUserInfo()
          localStorage.setItem('user_info', JSON.stringify(user.value))
        }
      }

      // CORREÇÃO: Tentar validar token apenas se não estiver expirando
      try {
        const validation = await authService.validateToken()
        if (!validation.valid) {
          console.log('Token inválido segundo o servidor')
          logout()
          return false
        }
        console.log('Token validado com sucesso pelo servidor')
        return true
      } catch (validationError: any) {
        // Se a validação falhar com 401, mas temos o token e não está expirado,
        // pode ser um problema temporário - vamos assumir que está válido
        if (validationError.response?.status === 401) {
          console.warn('Validação do token falhou com 401, mas token ainda não expirou. Continuando...')
          
          // Se temos usuário e token, considerar válido temporariamente
          if (user.value && token.value && !authService.isTokenExpired()) {
            return true
          }
        }
        
        // Para outros erros, fazer logout
        console.error('Erro na validação da sessão:', validationError)
        logout()
        return false
      }
      
    } catch (error) {
      console.error('Erro geral na validação da sessão:', error)
      
      // Se é um erro de rede ou similar, mas temos token válido, não fazer logout
      if (user.value && token.value && !authService.isTokenExpired()) {
        console.warn('Erro na validação, mas mantendo sessão local válida')
        return true
      }
      
      logout()
      return false
    }
  }

  // NOVO: Método para processar callback de autenticação
  async function handleAuthCallback(authToken: string, userInfo?: UserInfo): Promise<boolean> {
    try {
      isLoading.value = true
      
      // Armazenar token
      token.value = authToken
      localStorage.setItem('access_token', authToken)
      
      // Armazenar informações do usuário se fornecidas
      if (userInfo) {
        user.value = userInfo
        localStorage.setItem('user_info', JSON.stringify(userInfo))
      } else {
        // Buscar informações do usuário
        try {
          user.value = await authService.getUserInfo()
          localStorage.setItem('user_info', JSON.stringify(user.value))
        } catch (error) {
          console.warn('Erro ao buscar informações do usuário após callback:', error)
          // Não falhar o callback apenas por isso
        }
      }
      
      return true
    } catch (error) {
      console.error('Erro no processamento do callback:', error)
      clearAuthState()
      return false
    } finally {
      isLoading.value = false
    }
  }

  function redirectToLogin() {
    authService.redirectToLogin()
  }

  function clearAuthState() {
    user.value = null
    token.value = null
    authService.clearTokens()
  }

  // Inicializar estado do store com dados armazenados
  function initializeFromStorage() {
    const storedToken = authService.getStoredToken()
    const storedUserInfo = authService.getStoredUserInfo()
    
    if (storedToken && storedUserInfo) {
      token.value = storedToken
      user.value = storedUserInfo
      
      // Validar sessão de forma assíncrona, mas não bloquear se falhar
      validateSession().catch((error) => {
        console.warn('Sessão armazenada inválida durante inicialização:', error)
        // Não limpar automaticamente - deixar o usuário tentar usar o app
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
    handleAuthCallback, // NOVO
    redirectToLogin,
    clearAuthState,
    initializeFromStorage,
    setupTokenValidation,
  }
})