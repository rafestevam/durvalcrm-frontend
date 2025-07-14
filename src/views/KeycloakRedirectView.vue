<!-- 
  Arquivo: src/views/KeycloakRedirectView.vue
  
  Componente simples que redireciona automaticamente para o Keycloak
  Substitui o LoginView.vue removido
-->

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Redirecionando...
          </h2>
          
          <p class="text-gray-600 mb-4">
            Você será redirecionado para a página de login do Keycloak.
          </p>
          
          <p class="text-sm text-gray-500">
            Se o redirecionamento não funcionar automaticamente, 
            <button 
              @click="redirectToKeycloak" 
              class="text-blue-600 hover:text-blue-500 underline"
            >
              clique aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

function redirectToKeycloak() {
  authStore.redirectToLogin()
}

// Redireciona automaticamente quando o componente é montado
onMounted(() => {
  redirectToKeycloak()
})
</script>