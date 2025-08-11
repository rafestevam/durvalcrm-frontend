/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  const environment = env.VITE_APP_ENVIRONMENT || mode
  
  // Check if building for WildFly deployment or NGINX
  const isWildflyBuild = process.env.npm_lifecycle_event === 'build:wildfly'
  const isNginxBuild = process.env.VITE_NGINX_BUILD === 'true' || process.env.npm_lifecycle_event === 'build:nginx'
  
  console.log(`🚀 Building for environment: ${environment} (mode: ${mode})`)
  if (isWildflyBuild) {
    console.log(`📦 Building for WildFly deployment with base: /durvalcrm-frontend/`)
  }
  if (isNginxBuild) {
    console.log(`🔧 Building for NGINX proxy with base: /crm/`)
  }

  return {
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts']
  },
  server: {
    port: 5173,
    host: true,
    cors: true,
    proxy: environment === 'dev' ? {
      // Em desenvolvimento local, proxy direto para o Nginx local na porta 9080
      '/api': {
        target: 'http://127.0.0.1:9080',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Dev Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Dev Request to Nginx:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Dev Response from Nginx:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy também para Keycloak durante desenvolvimento
      '/admin': {
        target: 'http://127.0.0.1:9080',
        changeOrigin: true,
        secure: false,
      }
    } : environment === 'staging' ? {
      // Em staging, proxy para o servidor remoto
      '/api': {
        target: 'https://20.127.155.169',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Staging Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Staging Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Staging Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    } : undefined // Produção não usa proxy local
  },
  base: isWildflyBuild ? '/durvalcrm-frontend/' :
        isNginxBuild ? '/crm/' :
        (environment === 'production' || environment === 'staging' ? '/crm/' : '/'),
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia', 'axios'],
          'ui': ['@headlessui/vue', '@heroicons/vue'],
          'charts': ['chart.js', 'vue-chartjs']
        }
      }
    }
  }
  }
})