// src/services/types.ts

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

export enum StatusMensalidade {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  ATRASADA = 'ATRASADA'
}

// Interface única para Mensalidade (removendo duplicação)
export interface Mensalidade {
  id: string
  associadoId: string
  associado?: Associado
  nomeAssociado?: string
  mesReferencia: number
  anoReferencia: number
  valor: number
  status: StatusMensalidade
  dataVencimento: string
  dataPagamento?: string
  qrCodePix?: string
  identificadorPix?: string
  vencida?: boolean
}

export interface Venda {
  id: string
  descricao: string
  valor: number
  origem: 'CANTINA' | 'BAZAR' | 'LIVROS'
  formaPagamento: 'PIX' | 'DINHEIRO'
  dataVenda: string
  criadoEm: string
  atualizadoEm?: string
}

export interface ResumoVendas {
  dataInicio: string
  dataFim: string
  totalVendas: number
  valorTotalVendas: number
  valorMedioVenda: number
  vendasCantina: number
  vendasBazar: number
  vendasLivros: number
  valorCantina: number
  valorBazar: number
  valorLivros: number
  percentualCantina: number
  percentualBazar: number
  percentualLivros: number
  associadoMaisVendas?: string
  vendasAssociadoTop?: number
}

export interface FormValidationErrors {
  [key: string]: string
}

export interface AlertMessage {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  show: boolean
}

// Interface corrigida para corresponder ao ResumoMensalidadesDTO do backend
export interface ResumoMensalidades {
  totalAssociados: number
  totalPendentes: number
  totalPagas: number
  totalAtrasadas: number
  valorTotalEsperado: number
  valorArrecadado: number
  valorPendente: number
  valorAtrasado: number
  percentualArrecadacao: number
  mes: number
  ano: number
}

export interface ResultadoGeracao {
  cobrancasGeradas: number
  jaExistiam: number
  totalAssociados: number
  mensagem: string
}

export interface PeriodoMensalidade {
  mes: number
  ano: number
  label: string
}

// Tipos para Pinia stores
export interface AuthState {
  user: User | null
  keycloak: any | null  // Usando 'any' para evitar dependência do keycloak-js
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

// Tipos para o Dashboard
export interface DashboardData {
  receitaConsolidada: number
  receitaMensalidades: number
  receitaCantina: number
  receitaBazar: number
  receitaLivros: number
  receitaDoacoes: number
  pagantesMes: number
  totalAssociados: number
  adimplentes: Associado[]
  inadimplentes: Associado[]
}

export interface ReceitasPorMetodoPagamento {
  totalPix: number
  totalDinheiro: number
  totalGeral: number
}