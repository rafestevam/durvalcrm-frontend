<template>
  <nav class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200">
    <div class="flex h-full flex-col">
      <!-- Logo -->
      <div class="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <h2 class="text-lg font-bold text-blue-600">
          DurvalCRM
        </h2>
        <!-- Close button for mobile -->
        <button
          type="button"
          class="lg:hidden -mr-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          @click="$emit('navigate')"
        >
          <span class="sr-only">Fechar menu</span>
          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 px-4 py-6 overflow-y-auto">
        <ul class="space-y-2">
          <li v-for="item in navigation" :key="item.name">
            <router-link
              :to="item.href"
              class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
              :class="[
                $route.path === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
              @click="$emit('navigate')"
            >
              <component
                :is="item.icon"
                class="mr-3 h-5 w-5 flex-shrink-0"
                :class="[
                  $route.path === item.href
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                ]"
                aria-hidden="true"
              />
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 p-4">
        <p class="text-xs text-gray-500 text-center">
          <span class="font-semibold text-blue-600">DurvalCRM</span> v{{ APP_CONFIG.version }}
        </p>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  UsersIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  GiftIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { APP_CONFIG, ROUTES } from '@/utils/constants'

// Emit event when navigation item is clicked (para fechar o menu mobile)
defineEmits<{
  (e: 'navigate'): void
}>()

const navigation = [
  {
    name: 'Painel',
    href: ROUTES.PAINEL,
    icon: ChartBarIcon,
  },
  {
    name: 'Associados',
    href: ROUTES.ASSOCIADOS,
    icon: UsersIcon,
  },
  {
    name: 'Mensalidades',
    href: ROUTES.MENSALIDADES,
    icon: CreditCardIcon,
  },
  {
    name: 'Vendas',
    href: ROUTES.VENDAS,
    icon: ShoppingCartIcon,
  },
  {
    name: 'Doações',
    href: ROUTES.DOACOES,
    icon: GiftIcon,
  },
]
</script>