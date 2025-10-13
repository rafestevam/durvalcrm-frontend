/**
 * Mock Factories for Frontend Tests
 * Provides factory functions to create test data with sensible defaults
 */

import type { Associado, Mensalidade, Doacao, Venda, Usuario } from '@/types'

/**
 * Creates a mock Associado with default values
 */
export function createMockAssociado(overrides?: Partial<Associado>): Associado {
  return {
    id: crypto.randomUUID(),
    nomeCompleto: 'João da Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
    telefone: '(11) 98765-4321',
    ativo: true,
    ...overrides
  }
}

/**
 * Creates a mock Mensalidade with default values
 */
export function createMockMensalidade(overrides?: Partial<Mensalidade>): Mensalidade {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    associadoId: crypto.randomUUID(),
    associadoNome: 'João da Silva',
    mesReferencia: now.getMonth() + 1,
    anoReferencia: now.getFullYear(),
    valor: 10.90,
    status: 'PENDENTE',
    dataVencimento: new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split('T')[0],
    qrCodePix: null,
    identificadorPix: `MENS${crypto.randomUUID().substring(0, 8)}`,
    dataPagamento: null,
    metodoPagamento: null,
    ...overrides
  }
}

/**
 * Creates a mock Doacao with default values
 */
export function createMockDoacao(overrides?: Partial<Doacao>): Doacao {
  return {
    id: crypto.randomUUID(),
    associadoId: crypto.randomUUID(),
    associadoNome: 'João da Silva',
    valor: 50.00,
    tipo: 'UNICA',
    status: 'CONFIRMADA',
    descricao: 'Doação de teste',
    dataDoacao: new Date().toISOString(),
    metodoPagamento: 'PIX',
    ...overrides
  }
}

/**
 * Creates a mock Venda with default values
 */
export function createMockVenda(overrides?: Partial<Venda>): Venda {
  return {
    id: crypto.randomUUID(),
    descricao: 'Venda de produtos',
    valor: 25.00,
    origem: 'CANTINA',
    formaPagamento: 'DINHEIRO',
    dataVenda: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Creates a mock Usuario with default values
 */
export function createMockUsuario(overrides?: Partial<Usuario>): Usuario {
  return {
    id: crypto.randomUUID(),
    nome: 'Admin User',
    email: 'admin@example.com',
    roles: ['USER'],
    ...overrides
  }
}

/**
 * Creates an array of mock items using a factory function
 */
export function createMockArray<T>(
  factory: (index: number) => T,
  count: number
): T[] {
  return Array.from({ length: count }, (_, index) => factory(index))
}

/**
 * Creates paginated mock data
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function createMockPaginatedResponse<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResponse<T> {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedItems = items.slice(start, end)

  return {
    items: paginatedItems,
    total,
    page,
    pageSize,
    totalPages
  }
}
