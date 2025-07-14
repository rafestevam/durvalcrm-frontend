<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <LoadingSpinner v-if="isLoading" class="w-8 h-8 mx-auto mb-4" />
          <div v-else-if="error" class="text-red-500 mb-4">
            <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          
          <h2 class="text-lg font-medium text-gray-900 mb-2">
            <span v-if="isLoading">Finalizando autenticação...</span>
            <span v-else-if="error">Erro na autenticação</span>
            <span v-else>Redirecionando...</span>
          </h2>
          
          <p class="text-sm text-gray-600">
            <span v-if="isLoading">Aguarde enquanto processamos seu login.</span>
            <span v-else-if="error">{{ error }}</span>
            <span v-else>Você será redirecionado em instantes.</span>
          </p>
          
          <div v-if="error" class="mt-4">
            <button 
              @click="redirectToLogin"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Tentar novamente
            </button>
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
    
    // Verificar se houve erro no callback
    if (errorParam) {
      throw new Error(`Erro na autenticação: ${errorParam}`)
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