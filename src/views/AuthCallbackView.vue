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