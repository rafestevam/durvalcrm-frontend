import type Keycloak from 'keycloak-js'

// Tipos de dados da aplicação
export interface Associado {
  id?: string
  nomeCompleto: string
  cpf: string
  email: string
  telefone?: string
  ativo?: boolean
  criadoEm?: string
}

export interface AssociadoForm {
  nomeCompleto: string
  cpf: string
  email: string
  telefone: string
}

export interface User {
  id?: string
  email: string
  name: string
  username: string
  firstName?: string
  lastName?: string
  roles?: string[]
}

export interface KeycloakUser {
  sub: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
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

export interface FormValidationErrors {
  [key: string]: string
}

export interface AlertMessage {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  show: boolean
}

// Tipos para Pinia stores
export interface AuthState {
  user: User | null
  keycloak: Keycloak | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  initialized: boolean
}

export interface AssociadosState {
  associados: Associado[]
  loading: boolean
  searchQuery: string
  selectedAssociado: Associado | null
}

// Configuração do Keycloak
export interface KeycloakConfig {
  url: string
  realm: string
  clientId: string
}