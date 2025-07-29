<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// App principal - todo o roteamento é gerenciado pelo router-view

// Listener para detectar problemas de autenticação
let messageListener: ((event: MessageEvent) => void) | null = null

onMounted(() => {
  // Detectar redirecionamentos bloqueados via postMessage
  messageListener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    
    if (event.data?.type === 'AUTH_BLOCKED') {
      console.log('Recebido sinal de autenticação bloqueada')
      
      // Tentar redirecionar para a página de callback manualmente
      const currentUrl = new URL(window.location.href)
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      
      // Copiar parâmetros de query se existirem
      currentUrl.searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value)
      })
      
      console.log('Redirecionando para callback:', callbackUrl.href)
      window.location.replace(callbackUrl.href)
    }
  }
  
  window.addEventListener('message', messageListener)
  
  // Detectar se a URL atual é about:blank#blocked
  if (window.location.href === 'about:blank#blocked' || 
      window.location.href.includes('#blocked')) {
    console.log('Detectado about:blank#blocked no App.vue')
    
    // Tentar redirecionar para a página principal
    setTimeout(() => {
      window.location.replace('http://localhost:8080/')
    }, 1000)
  }
})

onUnmounted(() => {
  if (messageListener) {
    window.removeEventListener('message', messageListener)
  }
})
</script>
