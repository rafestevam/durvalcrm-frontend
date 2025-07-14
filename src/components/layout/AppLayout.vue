<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    
    <div class="flex">
      <AppNavigation class="hidden lg:block" />
      
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
import AppHeader from './AppHeader.vue'
import AppNavigation from './AppNavigation.vue'
</script>