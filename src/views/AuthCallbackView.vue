<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <div v-if="isLoading" class="space-y-4">
            <LoadingSpinner size="lg" />
            <h2 class="text-lg font-medium text-gray-900">
              Processando autenticação...
            </h2>
            <p class="text-sm text-gray-600">
              Aguarde enquanto validamos suas credenciais.
            </p>
          </div>
          
          <div v-else-if="error" class="space-y-4">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div>
              <h2 class="text-lg font-medium text-gray-900">
                Erro na Autenticação
              </h2>
              <p class="text-sm text-red-600 mt-2">
                {{ error }}
              </p>
            </div>
            
            <div class="mt-6">
              <button
                type="button"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="redirectToLogin"
              >
                Tentar Novamente
              </button>
            </div>
            
            <p class="text-xs text-gray-500">
              Você será redirecionado automaticamente em alguns segundos...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/utils/constants'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import authService from '@/services/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  await handleAuthCallback()
})

async function handleAuthCallback() {
  try {
    isLoading.value = true
    error.value = null
    
    // Verificar se há código de autorização na URL
    const code = route.query.code as string
    const state = route.query.state as string
    const errorParam = route.query.error as string
    const errorDescription = route.query.error_description as string
    
    console.log('Parâmetros do callback:', {
      code: code ? code.substring(0, 10) + '...' : 'ausente',
      state: state ? 'presente' : 'ausente',
      error: errorParam,
      error_description: errorDescription
    })
    
    // Verificar se houve erro no callback
    if (errorParam) {
      let errorMessage = `Erro na autenticação: ${errorParam}`
      if (errorDescription) {
        errorMessage += ` - ${errorDescription}`
      }
      
      // Mapear erros comuns para mensagens mais amigáveis
      switch (errorParam) {
        case 'invalid_request':
          errorMessage = 'Configuração de autenticação inválida. Verifique as configurações do Keycloak.'
          break
        case 'unauthorized_client':
          errorMessage = 'Cliente não autorizado. Verifique a configuração do cliente no Keycloak.'
          break
        case 'access_denied':
          errorMessage = 'Acesso negado pelo usuário.'
          break
        case 'invalid_scope':
          errorMessage = 'Escopo de permissões inválido.'
          break
        case 'server_error':
          errorMessage = 'Erro interno do servidor de autenticação.'
          break
        case 'temporarily_unavailable':
          errorMessage = 'Serviço de autenticação temporariamente indisponível.'
          break
      }
      
      throw new Error(errorMessage)
    }
    
    // Verificar se o código está presente
    if (!code) {
      throw new Error('Código de autorização não encontrado na URL')
    }
    
    console.log('Processando código de autorização...', { code: code.substring(0, 10) + '...' })
    
    // Processar callback através do AuthService
    const success = await authService.handleCallback(code, window.location.origin + '/auth/callback')
    
    if (success) {
      // Redirecionar para dashboard
      await router.push(ROUTES.DASHBOARD)
    } else {
      throw new Error('Falha no processamento do código de autorização')
    }
    
  } catch (err) {
    console.error('Erro no callback de autenticação:', err)
    error.value = err instanceof Error ? err.message : 'Erro desconhecido na autenticação'
    isLoading.value = false
    
    // Após 5 segundos, redirecionar para login automaticamente
    setTimeout(() => {
      redirectToLogin()
    }, 5000)
  }
}

function redirectToLogin() {
  authStore.redirectToLogin()
}
</script>