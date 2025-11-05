/**
 * Types for Epic 01 - Gestão de Caixa e Recebimentos
 */

export enum TipoConta {
  BANCARIA = 'BANCARIA',
  CAIXA_FISICO = 'CAIXA_FISICO'
}

export enum FinalidadeConta {
  PIX = 'PIX',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  DINHEIRO_DEPOSITOS = 'DINHEIRO_DEPOSITOS',
  OPERACIONAL = 'OPERACIONAL',
  OUTROS = 'OUTROS'
}

export enum StatusConta {
  ATIVA = 'ATIVA',
  INATIVA = 'INATIVA'
}

export enum FormaPagamentoRecebimento {
  PIX = 'PIX',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  DINHEIRO = 'DINHEIRO'
}

export enum OrigemRecebimento {
  MENSALIDADE = 'MENSALIDADE',
  VENDA_PRODUTOS = 'VENDA_PRODUTOS',
  TRANSFERENCIA_BAZAR = 'TRANSFERENCIA_BAZAR',
  VENDA_CANTINA = 'VENDA_CANTINA',
  OUTROS = 'OUTROS'
}

export interface ContaBancaria {
  id?: string
  nome: string
  tipo: TipoConta
  finalidade: FinalidadeConta
  status: StatusConta
  banco?: string | null
  agencia?: string | null
  numeroConta?: string | null
  saldoInicial: number
  dataSaldoInicial: string | number[] // ISO date string or [year, month, day] from backend
  saldoAtual: number
}

export interface Recebimento {
  id?: string
  dataRecebimento: string | number[] // ISO date string or [year, month, day] from backend
  valor: number
  formaPagamento: FormaPagamentoRecebimento
  origem: OrigemRecebimento
  contaBancariaId: string
  associadoId?: string | null
  vendaId?: string | null
  mensalidadeId?: string | null
  descricao?: string | null
  observacoes?: string | null
}

// Form models (for creating/editing)
export interface ContaBancariaForm {
  nome: string
  tipo: TipoConta
  finalidade: FinalidadeConta
  banco?: string
  agencia?: string
  numeroConta?: string
  saldoInicial: number | string
  dataSaldoInicial: string
}

export interface RecebimentoForm {
  dataRecebimento: string
  valor: number | string
  formaPagamento: FormaPagamentoRecebimento
  origem: OrigemRecebimento
  contaBancariaId: string
  associadoId?: string
  vendaId?: string
  mensalidadeId?: string
  descricao?: string
  observacoes?: string
}

// Labels for enums
export const TipoContaLabel: Record<TipoConta, string> = {
  [TipoConta.BANCARIA]: 'Conta Bancária',
  [TipoConta.CAIXA_FISICO]: 'Caixa Físico'
}

export const FinalidadeContaLabel: Record<FinalidadeConta, string> = {
  [FinalidadeConta.PIX]: 'PIX',
  [FinalidadeConta.CARTAO_CREDITO]: 'Cartão de Crédito',
  [FinalidadeConta.CARTAO_DEBITO]: 'Cartão de Débito',
  [FinalidadeConta.DINHEIRO_DEPOSITOS]: 'Dinheiro (Depósitos)',
  [FinalidadeConta.OPERACIONAL]: 'Operacional',
  [FinalidadeConta.OUTROS]: 'Outros'
}

export const StatusContaLabel: Record<StatusConta, string> = {
  [StatusConta.ATIVA]: 'Ativa',
  [StatusConta.INATIVA]: 'Inativa'
}

export const FormaPagamentoRecebimentoLabel: Record<FormaPagamentoRecebimento, string> = {
  [FormaPagamentoRecebimento.PIX]: 'PIX',
  [FormaPagamentoRecebimento.CARTAO_CREDITO]: 'Cartão de Crédito',
  [FormaPagamentoRecebimento.CARTAO_DEBITO]: 'Cartão de Débito',
  [FormaPagamentoRecebimento.DINHEIRO]: 'Dinheiro'
}

export const OrigemRecebimentoLabel: Record<OrigemRecebimento, string> = {
  [OrigemRecebimento.MENSALIDADE]: 'Mensalidade',
  [OrigemRecebimento.VENDA_PRODUTOS]: 'Venda de Produtos',
  [OrigemRecebimento.TRANSFERENCIA_BAZAR]: 'Transferência de Bazar',
  [OrigemRecebimento.VENDA_CANTINA]: 'Venda de Cantina',
  [OrigemRecebimento.OUTROS]: 'Outros'
}

// Dashboard types (US-062)
export interface SaldoContaDTO {
  id: string
  nome: string
  finalidade: FinalidadeConta
  saldoAtual: number
  abaixoMinimo: boolean
}

export interface RecebimentoPorFormaPagamentoDTO {
  formaPagamento: FormaPagamentoRecebimento
  total: number
  quantidade: number
  percentual: number
}

export interface RecebimentoPorOrigemDTO {
  origem: OrigemRecebimento
  total: number
  quantidade: number
  percentual: number
}

export interface RecebimentosPeriodoDTO {
  dataInicio: string
  dataFim: string
  totalPeriodo: number
  porFormaPagamento: RecebimentoPorFormaPagamentoDTO[]
  porOrigem: RecebimentoPorOrigemDTO[]
}

export interface DashboardFinanceiroDTO {
  saldoTotalConsolidado: number
  contasBancarias: SaldoContaDTO[]
  caixasFisicos: SaldoContaDTO[]
  recebimentosPeriodo: RecebimentosPeriodoDTO
}

// Statement types (US-064)
export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  TRANSFERENCIA_ENTRADA = 'TRANSFERENCIA_ENTRADA',
  TRANSFERENCIA_SAIDA = 'TRANSFERENCIA_SAIDA'
}

export const TipoMovimentacaoLabel: Record<TipoMovimentacao, string> = {
  [TipoMovimentacao.ENTRADA]: 'Entrada',
  [TipoMovimentacao.SAIDA]: 'Saída',
  [TipoMovimentacao.TRANSFERENCIA_ENTRADA]: 'Transferência (Entrada)',
  [TipoMovimentacao.TRANSFERENCIA_SAIDA]: 'Transferência (Saída)'
}

export interface MovimentacaoExtratoDTO {
  id: string
  data: string
  dataHora: string
  tipo: TipoMovimentacao
  formaPagamento?: FormaPagamentoRecebimento
  origem?: OrigemRecebimento
  descricao?: string
  valor: number
  saldoApos: number
  vinculoId?: string
  vinculoTipo?: string
}

export interface ExtratoContaDTO {
  contaId: string
  nomeConta: string
  dataInicio: string
  dataFim: string
  saldoInicial: number
  saldoFinal: number
  totalEntradas: number
  totalSaidas: number
  movimentacoes: MovimentacaoExtratoDTO[]
}
