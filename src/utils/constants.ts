export const ROUTES = {
  // Rotas de autenticação
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  LOGOUT: '/logout',
  
  // Rotas principais
  HOME: '/',
  DASHBOARD: '/dashboard',
  
  // Rotas de funcionalidades
  ASSOCIADOS: '/associados',
  ASSOCIADOS_NOVO: '/associados/novo',
  ASSOCIADOS_EDITAR: '/associados/:id/editar',
  
  MENSALIDADES: '/mensalidades',
  
  VENDAS: '/vendas',
  
  RECONCILIACAO: '/reconciliacao',
  
  // Rotas de configuração
  CONFIGURACOES: '/configuracoes',
  PERFIL: '/perfil',
  
  // Rotas de erro
  NOT_FOUND: '/404',
} as const

export const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    LOGIN_INFO: '/auth/login-info',
    CALLBACK: '/auth/callback',
    ME: '/auth/me',
    VALIDATE: '/auth/validate',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // Associados
  ASSOCIADOS: {
    LIST: '/associados',
    CREATE: '/associados',
    GET: (id: string) => `/associados/${id}`,
    UPDATE: (id: string) => `/associados/${id}`,
    DELETE: (id: string) => `/associados/${id}`,
    SEARCH: '/associados/search',
  },
  
  // Mensalidades
  MENSALIDADES: {
    LIST: '/mensalidades',
    CREATE: '/mensalidades',
    GET: (id: string) => `/mensalidades/${id}`,
    UPDATE: (id: string) => `/mensalidades/${id}`,
    DELETE: (id: string) => `/mensalidades/${id}`,
    GERAR_COBRANCAS: '/mensalidades/gerar-cobrancas',
  },
  
  // Vendas
  VENDAS: {
    LIST: '/vendas',
    CREATE: '/vendas',
    GET: (id: string) => `/vendas/${id}`,
    UPDATE: (id: string) => `/vendas/${id}`,
    DELETE: (id: string) => `/vendas/${id}`,
  },
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  USER_INFO: 'user_info',
  OAUTH_STATE: 'oauth_state',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
} as const

export const APP_CONFIG = {
  NAME: 'DurvalCRM',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de gestão para associação',
  
  // Configurações de autenticação
  AUTH: {
    TOKEN_REFRESH_THRESHOLD_MINUTES: 5,
    SESSION_CHECK_INTERVAL_MS: 60000, // 1 minuto
    MAX_LOGIN_ATTEMPTS: 3,
    LOGOUT_REDIRECT_DELAY_MS: 3000,
  },
  
  // Configurações de UI
  UI: {
    TOAST_DURATION_MS: 5000,
    LOADING_DELAY_MS: 300,
    DEBOUNCE_DELAY_MS: 500,
  },
  
  // Configurações de API
  API: {
    TIMEOUT_MS: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
  },
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  SERVER_ERROR: 'Erro interno do servidor. Tente novamente.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
  
  // Erros específicos de autenticação
  AUTH: {
    NO_CODE: 'Código de autorização não encontrado',
    INVALID_STATE: 'Estado OAuth inválido - possível ataque CSRF',
    TOKEN_EXCHANGE_FAILED: 'Falha na obtenção do token',
    USER_INFO_FAILED: 'Falha ao buscar dados do usuário',
    LOGIN_REQUIRED: 'Login necessário para acessar esta página',
    LOGOUT_FAILED: 'Erro ao fazer logout',
  },
} as const