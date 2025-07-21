export enum StatusDoacao {
  PENDENTE = 'PENDENTE',
  PROCESSANDO = 'PROCESSANDO',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA'
}

export enum TipoDoacao {
  UNICA = 'UNICA',
  RECORRENTE = 'RECORRENTE'
}

export interface Doacao {
  id: number
  associadoId: number
  nomeAssociado: string
  valor: number
  tipo: TipoDoacao
  status: StatusDoacao
  descricao?: string
  dataDoacao: string
  dataConfirmacao?: string
  codigoTransacao?: string
  metodoPagamento?: string
  createdAt: string
  updatedAt: string
}

export interface DoacaoFormData {
  associadoId: number
  valor: number
  tipo: TipoDoacao
  descricao?: string
  dataDoacao?: string
}

export interface DoacaoEstatisticas {
  totalArrecadado: number
  totalDoacoes: number
  doacoesConfirmadas: number
  doacoesPendentes: number
  doacoesCanceladas: number
  ticketMedio: number
}

export interface ConfirmarPagamentoData {
  codigoTransacao: string
  metodoPagamento: string
}