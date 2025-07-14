// Tipos compartilhados da aplicação
export interface Associado {
  id?: string
  nomeCompleto: string
  cpf: string
  email: string
  telefone?: string
}

export interface Mensalidade {
  id: string
  associadoId: string
  associado?: Associado
  mesReferencia: number
  anoReferencia: number
  valor: number
  status: 'PENDENTE' | 'PAGA' | 'ATRASADA'
  dataVencimento: string
  dataPagamento?: string
}

export interface Venda {
  id?: string
  valor: number
  origem: 'CANTINA' | 'BAZAR' | 'LIVROS'
  dataVenda: string
}

export interface Usuario {
  username: string
  email?: string
  name?: string
  roles?: string[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
