// Constantes da aplicação

export const APP_CONFIG = {
  name: 'DurvalCRM',
  version: '1.0.0',
  description: 'Sistema de Gestão para Associações',
} as const

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  ASSOCIADOS: '/associados',
  MENSALIDADES: '/mensalidades',
  VENDAS: '/vendas',
  AUTH_CALLBACK: '/auth/callback',
} as const

export const VENDA_ORIGENS = [
  { value: 'CANTINA', label: 'Cantina' },
  { value: 'BAZAR', label: 'Bazar' },
  { value: 'LIVROS', label: 'Livros' },
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
