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
  
  // Inicializar com mês/ano atual
  const hoje = new Date()
  const periodoSelecionado = ref<PeriodoMensalidade>({
    mes: hoje.getMonth() + 1,
    ano: hoje.getFullYear(),
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
    // Validar e definir parâmetros
    let mesValido = mes
    let anoValido = ano

    if (mes !== undefined && ano !== undefined) {
      // Validar parâmetros fornecidos
      if (mes < 1 || mes > 12) {
        error.value = 'Mês deve estar entre 1 e 12'
        return
      }
      if (ano < 2020 || ano > 2030) {
        error.value = 'Ano deve estar entre 2020 e 2030'
        return
      }
      
      periodoSelecionado.value = { mes, ano, label: '' }
      mesValido = mes
      anoValido = ano
    } else {
      // Usar período selecionado atual ou padrão
      const periodo = periodoSelecionado.value
      mesValido = periodo.mes
      anoValido = periodo.ano
    }

    // Validação adicional dos valores do período selecionado
    if (!mesValido || !anoValido || mesValido < 1 || mesValido > 12 || anoValido < 2020 || anoValido > 2030) {
      console.error('Parâmetros inválidos:', { mes: mesValido, ano: anoValido })
      error.value = 'Parâmetros de período inválidos'
      return
    }

    try {
      loading.value = true
      error.value = null

      console.log('Carregando dados para período:', { mes: mesValido, ano: anoValido })
      
      // Carregar resumo e mensalidades em paralelo
      const [resumoData, mensalidadesData] = await Promise.all([
        mensalidadeService.obterResumo(mesValido, anoValido),
        mensalidadeService.listarPorPeriodo(mesValido, anoValido)
      ])

      resumo.value = resumoData
      mensalidades.value = mensalidadesData

      console.log('Dados carregados com sucesso:', { 
        resumo: resumoData, 
        totalMensalidades: mensalidadesData.length 
      })

    } catch (err: any) {
      // Tratamento melhorado de erros
      console.error('Erro ao carregar mensalidades:', err)
      
      if (err.response?.status === 400) {
        error.value = err.response.data?.error || 'Parâmetros inválidos'
      } else if (err.response?.status === 401) {
        error.value = 'Não autorizado. Faça login novamente.'
      } else if (err.response?.status === 500) {
        error.value = 'Erro interno do servidor. Tente novamente.'
      } else if (err.code === 'NETWORK_ERROR' || !navigator.onLine) {
        error.value = 'Erro de conexão. Verifique sua internet.'
      } else {
        error.value = err.message || 'Erro ao carregar dados'
      }
    } finally {
      loading.value = false
    }
  }

  async function gerarCobrancas(): Promise<ResultadoGeracao> {
    try {
      loading.value = true
      error.value = null
      
      const periodo = periodoSelecionado.value
      
      // Validar período antes de enviar
      if (!periodo.mes || !periodo.ano || periodo.mes < 1 || periodo.mes > 12) {
        throw new Error('Período inválido para geração de cobranças')
      }
      
      console.log('Gerando cobranças para período:', periodo)
      
      const resultado = await mensalidadeService.gerarCobrancas(periodo.mes, periodo.ano)
      
      // Recarregar dados após gerar cobranças
      await carregarDados()
      
      return resultado
    } catch (err: any) {
      console.error('Erro ao gerar cobranças:', err)
      error.value = err.response?.data?.error || err.message || 'Erro ao gerar cobranças'
      throw err
    } finally {
      loading.value = false
    }
  }

  function alterarPeriodo(mes: number, ano: number) {
    // Validar parâmetros
    if (mes < 1 || mes > 12) {
      console.error('Mês inválido:', mes)
      error.value = 'Mês deve estar entre 1 e 12'
      return
    }
    
    if (ano < 2020 || ano > 2030) {
      console.error('Ano inválido:', ano)
      error.value = 'Ano deve estar entre 2020 e 2030'
      return
    }

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

  function resetarDados() {
    mensalidades.value = []
    resumo.value = null
    error.value = null
    loading.value = false
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
    limparErro,
    resetarDados
  }
})