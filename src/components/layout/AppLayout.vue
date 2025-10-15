<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader @toggle-mobile-menu="toggleMobileMenu" />

    <div class="flex">
      <!-- Desktop Navigation -->
      <AppNavigation class="hidden lg:block" />

      <!-- Mobile Navigation Overlay -->
      <Transition
        enter-active-class="transition-opacity ease-linear duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity ease-linear duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          @click="closeMobileMenu"
        />
      </Transition>

      <!-- Mobile Navigation Sidebar -->
      <Transition
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-from-class="-translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-from-class="translate-x-0"
        leave-to-class="-translate-x-full"
      >
        <div v-if="mobileMenuOpen" class="lg:hidden">
          <AppNavigation @navigate="closeMobileMenu" />
        </div>
      </Transition>

      <main class="flex-1 lg:ml-64">
        <div class="py-6">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <!-- Slot para header da página -->
            <div v-if="$slots.header" class="mb-6">
              <slot name="header" />
            </div>

            <!-- Conteúdo principal -->
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppNavigation from './AppNavigation.vue'

const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>