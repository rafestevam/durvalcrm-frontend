<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
        {{ APP_CONFIG.name }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Acesse o sistema para continuar
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-6">
          <AlertMessage
            v-if="error"
            type="error"
            :message="error"
            @dismiss="error = ''"
          />
          
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-4">
              Faça login usando sua conta do Keycloak
            </p>
            
            <BaseButton
              variant="primary"
              size="lg"
              :loading="isLoading"
              :full-width="true"
              @click="handleLogin"
            >
              <template v-if="!isLoading">
                Entrar com Keycloak
              </template>
              <template v-else>
                Redirecionando...
              </template>
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { APP_CONFIG, ROUTES } from '@/utils/constants'
import BaseButton from '@/components/common/BaseButton.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const error = ref('')

async function handleLogin() {
  try {
    isLoading.value = true
    error.value = ''
    
    // Redireciona para o Keycloak
    authStore.redirectToLogin()
  } catch (err) {
    console.error('Erro no login:', err)
    error.value = 'Erro ao conectar com o servidor de autenticação'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Se já está autenticado, redireciona para o dashboard
  if (authStore.isAuthenticated) {
    router.push(ROUTES.DASHBOARD)
  }
})
</script>
