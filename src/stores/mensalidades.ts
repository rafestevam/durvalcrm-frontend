import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mensalidadeService } from '@/services/mensalidade'
import type { 
  Mensalidade, 
  ResumoMensalidades, 
  ResultadoGeracao,
  PeriodoMensalidade 
} from '@/services/types'

export const useMensalidadesStore = defineStore('mensalidades', () => {
  // Estado
  const mensalidades = ref<Mensalidade[]>([])
  const resumo = ref<ResumoMensalidades | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const periodoSelecionado = ref<PeriodoMensalidade>({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    label: ''
  })

  // Computed
  const mensalidadesPorStatus = computed(() => {
    return {
      pendentes: mensalidades.value.filter(m => m.status === 'PENDENTE'),
      pagas: mensalidades.value.filter(m => m.status === 'PAGA'),
      atrasadas: mensalidades.value.filter(m => m.status === 'ATRASADA')
    }
  })

  const periodoAtual = computed(() => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return `${meses[periodoSelecionado.value.mes - 1]} ${periodoSelecionado.value.ano}`
  })

  const temMensalidades = computed(() => mensalidades.value.length > 0)

  // Actions
  async function carregarDados(mes?: number, ano?: number) {
    if (mes !== undefined && ano !== undefined) {
      periodoSelecionado.value = { mes, ano, label: '' }
    }

    try {
      loading.value = true
      error.value = null

      const periodo = periodoSelecionado.value
      
      // Carregar resumo e mensalidades em paralelo
      const [resumoData, mensalidadesData] = await Promise.all([
        mensalidadeService.obterResumo(periodo.mes, periodo.ano),
        mensalidadeService.listarPorPeriodo(periodo.mes, periodo.ano)
      ])

      resumo.value = resumoData
      mensalidades.value = mensalidadesData

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar dados'
      console.error('Erro ao carregar mensalidades:', err)
    } finally {
      loading.value = false
    }
  }

  async function gerarCobrancas(): Promise<ResultadoGeracao> {
    try {
      loading.value = true
      const periodo = periodoSelecionado.value
      
      const resultado = await mensalidadeService.gerarCobrancas(periodo.mes, periodo.ano)
      
      // Recarregar dados após gerar cobranças
      await carregarDados()
      
      return resultado
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao gerar cobranças'
      throw err
    } finally {
      loading.value = false
    }
  }

  function alterarPeriodo(mes: number, ano: number) {
    periodoSelecionado.value = { mes, ano, label: '' }
    carregarDados()
  }

  function proximoPeriodo() {
    const { mes, ano } = periodoSelecionado.value
    if (mes === 12) {
      alterarPeriodo(1, ano + 1)
    } else {
      alterarPeriodo(mes + 1, ano)
    }
  }

  function periodoAnterior() {
    const { mes, ano } = periodoSelecionado.value
    if (mes === 1) {
      alterarPeriodo(12, ano - 1)
    } else {
      alterarPeriodo(mes - 1, ano)
    }
  }

  function limparErro() {
    error.value = null
  }

  return {
    // Estado
    mensalidades,
    resumo,
    loading,
    error,
    periodoSelecionado,
    
    // Computed
    mensalidadesPorStatus,
    periodoAtual,
    temMensalidades,
    
    // Actions
    carregarDados,
    gerarCobrancas,
    alterarPeriodo,
    proximoPeriodo,
    periodoAnterior,
    limparErro
  }
})