import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/utils/constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_URL || import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES.LOGIN,
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: ROUTES.AUTH_CALLBACK,
      name: 'AuthCallback',
      component: () => import('@/views/AuthCallbackView.vue'),
    },
    {
      path: ROUTES.DASHBOARD,
      name: 'Dashboard',
      redirect: ROUTES.PAINEL,
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.ASSOCIADOS,
      name: 'Associados',
      component: () => import('@/views/AssociadosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.MENSALIDADES,
      name: 'Mensalidades',
      component: () => import('@/views/MensalidadesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.VENDAS,
      name: 'Vendas',
      component: () => import('@/views/VendasView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.DOACOES,
      name: 'Doacoes',
      component: () => import('@/views/DoacoesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.PAINEL,
      name: 'Painel',
      component: () => import('@/views/PainelView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.CONTAS_BANCARIAS,
      name: 'ContasBancarias',
      component: () => import('@/views/ContasBancariasView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.DASHBOARD_FINANCEIRO,
      name: 'DashboardFinanceiro',
      component: () => import('@/views/DashboardFinanceiroView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: ROUTES.EXTRATO_CONTA,
      name: 'ExtratoConta',
      component: () => import('@/views/ExtratoContaView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: ROUTES.PAINEL,
    },
  ],
})

// Guard de autenticação
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  console.log('Router guard:', {
    from: from.path,
    to: to.path,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest,
    isAuthenticated: authStore.isAuthenticated
  })

  // Rotas que requerem autenticação
  if (to.meta.requiresAuth) {
    console.log('Rota requer autenticação, validando sessão...')
    const isValid = await authStore.validateSession()
    console.log('Validação da sessão:', isValid)
    
    if (!isValid) {
      console.log('Sessão inválida, redirecionando para login')
      next(ROUTES.LOGIN)
      return
    }
  }

  // Rotas que requerem usuário deslogado (como login)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('Usuário já autenticado, redirecionando para dashboard')
    next(ROUTES.DASHBOARD)
    return
  }

  console.log('Router guard: permitindo navegação')
  next()
})

export default router
