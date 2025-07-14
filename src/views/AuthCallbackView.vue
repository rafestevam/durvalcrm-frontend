<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <LoadingSpinner class="w-8 h-8 mx-auto mb-4" />
          <h2 class="text-lg font-medium text-gray-900 mb-2">
            Finalizando autenticação...
          </h2>
          <p class="text-sm text-gray-600">
            Aguarde enquanto processamos seu login.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/utils/constants'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  try {
    const code = route.query.code as string
    
    if (!code) {
      throw new Error('Código de autorização não encontrado')
    }
    
    // Em uma implementação real, você processaria o código aqui
    // Por enquanto, simulamos o sucesso
    console.log('Código de autorização:', code)
    
    // Simula obtenção de token (substituir pela implementação real)
    const mockToken = 'mock-jwt-token-' + Date.now()
    const success = await authStore.login(mockToken)
    
    if (success) {
      router.push(ROUTES.DASHBOARD)
    } else {
      throw new Error('Falha na autenticação')
    }
  } catch (error) {
    console.error('Erro no callback de autenticação:', error)
    router.push(ROUTES.LOGIN)
  }
})
</script>
