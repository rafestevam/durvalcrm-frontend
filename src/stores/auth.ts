import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type UserInfo } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || '')

  // Actions
  async function login(authToken: string) {
    try {
      isLoading.value = true
      token.value = authToken
      localStorage.setItem('auth_token', authToken)
      
      // Busca informações do usuário
      user.value = await authService.getUserInfo()
      
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
      if (token.value) {
        await authService.logout()
      }
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      // Limpa estado local independente do resultado da API
      user.value = null
      token.value = null
      localStorage.removeItem('auth_token')
    }
  }

  async function validateSession(): Promise<boolean> {
    if (!token.value) return false

    try {
      const validation = await authService.validateToken()
      if (!validation.valid) {
        logout()
        return false
      }
      
      // Se não temos dados do usuário, busca
      if (!user.value) {
        user.value = await authService.getUserInfo()
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
  }
})
