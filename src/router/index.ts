import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTES } from '@/utils/constants'

// Importa o componente de redirecionamento para Keycloak
const KeycloakRedirectView = () => import('@/views/KeycloakRedirectView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES.LOGIN,
      name: 'Login',
      component: KeycloakRedirectView,
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
      redirect: ROUTES.ASSOCIADOS,
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
      path: '/',
      name: 'Root',
      redirect: (to) => {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          return ROUTES.DASHBOARD
        } else {
          return ROUTES.LOGIN
        }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: (to) => {
        const authStore = useAuthStore()
        if (authStore.isAuthenticated) {
          return ROUTES.DASHBOARD
        } else {
          return ROUTES.LOGIN
        }
      },
    },
  ],
})

// Guard de autenticação
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Rotas que requerem autenticação
  if (to.meta.requiresAuth) {
    const isValid = await authStore.validateSession()
    if (!isValid) {
      // Em vez de ir para LOGIN, redireciona diretamente para Keycloak
      authStore.redirectToLogin()
      return
    }
  }

  // Rotas que requerem usuário deslogado (como login)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next(ROUTES.DASHBOARD)
    return
  }

  next()
})

export default router