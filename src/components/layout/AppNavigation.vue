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
        <ul class="space-y-1">
          <!-- Dashboard -->
          <li>
            <router-link
              :to="ROUTES.PAINEL"
              class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
              :class="[
                $route.path === ROUTES.PAINEL
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
              @click="$emit('navigate')"
            >
              <HomeIcon
                class="mr-3 h-5 w-5 flex-shrink-0"
                :class="[
                  $route.path === ROUTES.PAINEL
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                ]"
                aria-hidden="true"
              />
              Dashboard
            </router-link>
          </li>

          <!-- Gestão de Pessoas -->
          <li>
            <div class="mt-4 mb-2">
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gestão de Pessoas
              </h3>
            </div>
            <ul class="space-y-1">
              <li>
                <router-link
                  :to="ROUTES.ASSOCIADOS"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.ASSOCIADOS
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <UsersIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.ASSOCIADOS
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Associados
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Gestão Financeira -->
          <li>
            <div class="mt-4 mb-2">
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gestão Financeira
              </h3>
            </div>
            <ul class="space-y-1">
              <li>
                <router-link
                  :to="ROUTES.MENSALIDADES"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.MENSALIDADES
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <CreditCardIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.MENSALIDADES
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Mensalidades
                </router-link>
              </li>
              <li>
                <router-link
                  :to="ROUTES.DOACOES"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.DOACOES
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <GiftIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.DOACOES
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Doações
                </router-link>
              </li>
              <li>
                <router-link
                  :to="ROUTES.CATEGORIAS_FINANCEIRAS"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.CATEGORIAS_FINANCEIRAS
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <FolderIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.CATEGORIAS_FINANCEIRAS
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Categorias
                </router-link>
              </li>
              <li>
                <router-link
                  :to="ROUTES.RECEITAS"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.RECEITAS
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <BanknotesIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.RECEITAS
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Receitas
                </router-link>
              </li>
              <li>
                <router-link
                  :to="ROUTES.DESPESAS"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.DESPESAS
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <ReceiptPercentIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.DESPESAS
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Despesas
                </router-link>
              </li>
              <li>
                <router-link
                  :to="ROUTES.RELATORIOS_FINANCEIROS"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.RELATORIOS_FINANCEIROS
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <DocumentChartBarIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.RELATORIOS_FINANCEIROS
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Relatórios
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Gestão Comercial -->
          <li>
            <div class="mt-4 mb-2">
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gestão Comercial
              </h3>
            </div>
            <ul class="space-y-1">
              <li>
                <router-link
                  :to="ROUTES.VENDAS"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.VENDAS
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <ShoppingCartIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.VENDAS
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Vendas
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Relatórios e Analytics -->
          <li>
            <div class="mt-4 mb-2">
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Relatórios e Analytics
              </h3>
            </div>
            <ul class="space-y-1">
              <li>
                <router-link
                  :to="ROUTES.RELATORIOS_FINANCEIROS"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                  :class="[
                    $route.path === ROUTES.RELATORIOS_FINANCEIROS
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  ]"
                  @click="$emit('navigate')"
                >
                  <ChartBarIcon
                    class="mr-3 h-5 w-5 flex-shrink-0"
                    :class="[
                      $route.path === ROUTES.RELATORIOS_FINANCEIROS
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    ]"
                    aria-hidden="true"
                  />
                  Dashboard Executivo
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Configurações -->
          <li>
            <div class="mt-4 mb-2">
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Configurações
              </h3>
            </div>
            <ul class="space-y-1">
              <li>
                <a
                  href="#"
                  class="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                  title="Em desenvolvimento"
                >
                  <CogIcon
                    class="mr-3 h-5 w-5 flex-shrink-0 text-gray-300"
                    aria-hidden="true"
                  />
                  <span class="text-gray-400">Sistema</span>
                  <span class="ml-auto text-xs text-gray-400">(em breve)</span>
                </a>
              </li>
            </ul>
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
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  GiftIcon,
  ChartBarIcon,
  FolderIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  DocumentChartBarIcon,
  CogIcon,
} from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { APP_CONFIG, ROUTES } from '@/utils/constants'

// Emit event when navigation item is clicked (para fechar o menu mobile)
defineEmits<{
  (e: 'navigate'): void
}>()
</script>