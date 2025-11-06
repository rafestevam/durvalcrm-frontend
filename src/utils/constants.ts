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
  
  DOACOES: '/doacoes',

  PAINEL: '/painel',

  FINANCEIRO: '/financeiro',
  CONTAS_BANCARIAS: '/financeiro/contas',
  RECEBIMENTOS: '/financeiro/recebimentos',
  DASHBOARD_FINANCEIRO: '/financeiro/dashboard',
  EXTRATO_CONTA: '/financeiro/extrato/:id',

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
  
  // Mensalidades - CORRIGIDO para corresponder ao backend
  MENSALIDADES: {
    LIST: '/mensalidades',
    CREATE: '/mensalidades',
    GET: (id: string) => `/mensalidades/${id}`,
    UPDATE: (id: string) => `/mensalidades/${id}`,
    DELETE: (id: string) => `/mensalidades/${id}`,
    RESUMO: '/mensalidades/resumo', // ADICIONADO
    GERAR_COBRANCAS: '/mensalidades/gerar-cobrancas', 
    QRCODE: (id: string) => `/mensalidades/${id}/qrcode`, // ADICIONADO
  },
  
  // Vendas
  VENDAS: {
    LIST: '/vendas',
    CREATE: '/vendas',
    GET: (id: string) => `/vendas/${id}`,
    UPDATE: (id: string) => `/vendas/${id}`,
    DELETE: (id: string) => `/vendas/${id}`,
  },
  
  // Doações
  DOACOES: {
    LIST: '/doacoes',
    CREATE: '/doacoes',
    GET: (id: string) => `/doacoes/${id}`,
    UPDATE: (id: string) => `/doacoes/${id}`,
    DELETE: (id: string) => `/doacoes/${id}`,
    POR_ASSOCIADO: (associadoId: string) => `/doacoes/associado/${associadoId}`,
    POR_PERIODO: '/doacoes/periodo',
    CONFIRMAR_PAGAMENTO: (id: string) => `/doacoes/${id}/confirmar-pagamento`,
    CANCELAR: (id: string) => `/doacoes/${id}/cancelar`,
    ESTATISTICAS: '/doacoes/estatisticas',
    PIX: (id: string) => `/doacoes/${id}/pix`,
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
  name: 'DurvalCRM',
  version: '1.0.0',
  description: 'Sistema de gestão para associação',
  
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
    TIMEOUT_MS: 30000, // Aumentado para 30 segundos
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

// Constantes para Mensalidades
export const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
] as const

export const MENSALIDADE_STATUS = {
  PENDENTE: 'Pendente',
  PAGA: 'Paga',
  ATRASADA: 'Atrasada',
} as const

export const MENSALIDADE_STATUS_COLORS = {
  PENDENTE: 'bg-yellow-100 text-yellow-800',
  PAGA: 'bg-green-100 text-green-800',
  ATRASADA: 'bg-red-100 text-red-800',
} as const

// Constantes para Vendas
export const VENDA_ORIGENS = [
  { value: 'CANTINA', label: 'Cantina' },
  { value: 'BAZAR', label: 'Bazar' },
  { value: 'LIVROS', label: 'Livros' },
] as const

// US-067: Formas de Pagamento para Vendas
export const FORMAS_PAGAMENTO_VENDA = [
  { value: 'PIX', label: 'PIX', icon: '📱' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de Débito', icon: '💳' },
  { value: 'DINHEIRO', label: 'Dinheiro', icon: '💵' },
] as const

// Mapeamento de FormaPagamento para FinalidadeConta
export const FORMA_PAGAMENTO_TO_FINALIDADE = {
  'PIX': 'PIX',
  'CARTAO_CREDITO': 'CARTAO_CREDITO',
  'CARTAO_DEBITO': 'CARTAO_DEBITO',
  'DINHEIRO': 'DINHEIRO_DEPOSITOS',
} as const

// Constantes para Reconciliação
export const PAGAMENTO_METODOS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO', label: 'Cartão' },
] as const

export const ORIGEM_INFORMACAO = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'EXTRATO_CSV', label: 'Extrato CSV' },
  { value: 'EXTRATO_OFX', label: 'Extrato OFX' },
] as const

export const STATUS_MENSALIDADE = {
  PENDENTE: { label: 'Pendente', color: 'yellow' },
  PAGA: { label: 'Paga', color: 'green' },
  ATRASADA: { label: 'Atrasada', color: 'red' }
}

export const VALOR_MENSALIDADE = 10.90