<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between items-center">
        <!-- Logo e título -->
        <div class="flex items-center">
          <button
            type="button"
            class="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            @click="toggleMobileMenu"
          >
            <span class="sr-only">Abrir menu</span>
            <Bars3Icon class="h-6 w-6" aria-hidden="true" />
          </button>
          
          <div class="flex items-center ml-4 lg:ml-0">
            <h1 class="text-xl font-semibold text-gray-900">
              {{ APP_CONFIG.name }}
            </h1>
          </div>
        </div>

        <!-- Perfil do usuário -->
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-700">
            Olá, <strong>{{ authStore.username }}</strong>
          </span>
          
          <!-- Menu dropdown do usuário -->
          <div class="relative">
            <button
              type="button"
              class="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="toggleUserMenu"
            >
              <span class="sr-only">Abrir menu do usuário</span>
              <UserCircleIcon class="h-8 w-8 text-gray-400" />
            </button>
            
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <button
                  type="button"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  @click="logout"
                >
                  Sair
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bars3Icon, UserCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { APP_CONFIG, ROUTES } from '@/utils/constants'

const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)

function toggleMobileMenu() {
  // Implementar toggle do menu mobile se necessário
  console.log('Toggle mobile menu')
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

async function logout() {
  try {
    await authStore.logout()
    router.push(ROUTES.LOGIN)
  } catch (error) {
    console.error('Erro no logout:', error)
  }
}

// Fechar menu ao clicar fora
document.addEventListener('click', (event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
})
</script>
