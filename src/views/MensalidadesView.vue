<template>
  <AppLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <CurrencyDollarIcon class="h-8 w-8 text-blue-600" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Mensalidades</h1>
            <p class="text-sm text-gray-600">
              Gerencie as mensalidades dos associados
            </p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <SeletorPeriodo
            :mes="mensalidadesStore.periodoSelecionado.mes"
            :ano="mensalidadesStore.periodoSelecionado.ano"
            @alterar-periodo="mensalidadesStore.alterarPeriodo"
            @periodo-anterior="mensalidadesStore.periodoAnterior"
            @proximo-periodo="mensalidadesStore.proximoPeriodo"
          />
          
          <BaseButton
            variant="primary"
            @click="showGerarModal = true"
            :disabled="mensalidadesStore.loading"
          >
          <!--  :disabled="mensalidadesStore.loading" -->
            <PlusIcon class="h-4 w-4 mr-2" />
            Gerar Cobranças
          </BaseButton>
        </div>
      </div>
    </template>

    <!-- Alertas -->
    <AlertMessage
      v-if="mensalidadesStore.error"
      type="error"
      :message="mensalidadesStore.error"
      :auto-hide="false"
      @dismiss="mensalidadesStore.limparErro"
      class="mb-6"
    />

    <AlertMessage
      v-if="showSuccessAlert"
      type="success"
      :message="successMessage"
      :auto-hide="true"
      @dismiss="showSuccessAlert = false"
      class="mb-6"
    />

    <!-- Loading -->
    <div v-if="mensalidadesStore.loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Conteúdo principal -->
    <div v-else class="space-y-6">
      <!-- Cards de Resumo - CORRIGIDO: Removido v-if e adicionado valores padrão -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CardResumo
          titulo="Total de Associados"
          :valor="mensalidadesStore.resumo?.totalAssociados || 0"
          :icon="UsersIcon"
          icon-color="text-blue-500"
        />
        
        <CardResumo
          titulo="Mensalidades Pagas"
          :valor="mensalidadesStore.resumo?.totalPagas || 0"
          :icon="CheckCircleIcon"
          icon-color="text-green-500"
          :porcentagem="calcularPorcentagem(mensalidadesStore.resumo?.totalPagas || 0, mensalidadesStore.resumo?.totalAssociados || 0)"
          porcentagem-color="text-green-600"
        />
        
        <CardResumo
          titulo="Pendentes"
          :valor="mensalidadesStore.resumo?.totalPendentes || 0"
          :icon="ClockIcon"
          icon-color="text-yellow-500"
          :porcentagem="calcularPorcentagem(mensalidadesStore.resumo?.totalPendentes || 0, mensalidadesStore.resumo?.totalAssociados || 0)"
          porcentagem-color="text-yellow-600"
        />
        
        <CardResumo
          titulo="Valor Arrecadado"
          :valor="formatters.money(mensalidadesStore.resumo?.valorArrecadado || 0)"
          :icon="BanknotesIcon"
          icon-color="text-green-500"
        />
      </div>

      <!-- Tabela de Mensalidades -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">
            Mensalidades de {{ mensalidadesStore.periodoAtual }}
          </h2>
        </div>
        
        <TabelaMensalidades
          :mensalidades="mensalidades"
          @ver-qr-code="abrirModalQRCode"
          @marcar-paga="marcarComoPaga"
        />
      </div>
    </div>

    <!-- Modais -->
    <ModalGerarCobrancas
      v-model:show="showGerarModal"
      :periodo="mensalidadesStore.periodoSelecionado"
      :resumo="mensalidadesStore.resumo"
      :loading="mensalidadesStore.loading"
      @confirmar="gerarCobrancas"
      @close="showGerarModal = false"
    />

    <ModalQRCode
      v-model:show="showQRModal"
      :mensalidade="mensalidadeSelecionada"
      @close="showQRModal = false"
    />
  </AppLayout>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon,
  BanknotesIcon,
  PlusIcon 
} from '@heroicons/vue/24/outline'

import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

import CardResumo from '@/components/mensalidades/CardResumo.vue'
import SeletorPeriodo from '@/components/mensalidades/SeletorPeriodo.vue'
import TabelaMensalidades from '@/components/mensalidades/TabelaMensalidades.vue'
import ModalGerarCobrancas from '@/components/mensalidades/ModalGerarCobrancas.vue'
import ModalQRCode from '@/components/mensalidades/ModalQRCode.vue'

import { useMensalidadesStore } from '@/stores/mensalidades'
import { useAssociadosStore } from '@/stores/associados'
import { formatters } from '@/utils/formatters'
import type { Mensalidade } from '@/services/types'
import { mensalidadeService } from '@/services/mensalidade'

const mensalidadesStore = useMensalidadesStore()
const associadosStore = useAssociadosStore()

// Refs para alertas
const errorMessage = ref('')
const showErrorAlert = ref(false)
const successMessage = ref('')
const showSuccessAlert = ref(false)

const showGerarModal = ref(false)
const showQRModal = ref(false)
const mensalidadeSelecionada = ref<Mensalidade | null>(null)

// Computed para combinar mensalidades com nomes dos associados
const mensalidades = computed(() => {
  return mensalidadesStore.mensalidades.map(mensalidade => ({
    ...mensalidade,
    nomeAssociado: associadosStore.associados.find(
      a => a.id === mensalidade.associadoId
    )?.nomeCompleto || 'Nome não encontrado'
  }))
})

function calcularPorcentagem(valor: number, total: number): number {
  return total > 0 ? Math.round((valor / total) * 100) : 0
}

async function gerarCobrancas() {
  try {
    const resultado = await mensalidadesStore.gerarCobrancas()
    showGerarModal.value = false
    
    successMessage.value = resultado.mensagem || 'Cobranças geradas com sucesso!'
    showSuccessAlert.value = true
    
  } catch (error) {
    console.error('Erro ao gerar cobranças:', error)
    // Erro já tratado no store
  }
}

function abrirModalQRCode(mensalidade: Mensalidade) {
  console.log('=== FUNÇÃO abrirModalQRCode CHAMADA ===')
  console.log('Mensalidade recebida:', mensalidade.id)
  console.log('QR Code PIX:', mensalidade.qrCodePix)
  console.log('Estado atual showQRModal:', showQRModal.value)
  
  mensalidadeSelecionada.value = mensalidade
  showQRModal.value = true
  
  console.log('Estado após mudança showQRModal:', showQRModal.value)
  console.log('Mensalidade selecionada:', mensalidadeSelecionada.value?.id)
}

async function marcarComoPaga(mensalidade: Mensalidade) {
  if (confirm(`Confirma que a mensalidade de ${mensalidade.nomeAssociado} foi paga?`)) {
    try {
      console.log('=== MARCANDO COMO PAGA ===')
      console.log('Mensalidade ID:', mensalidade.id)
      
      await mensalidadeService.marcarComoPaga(mensalidade.id)
      console.log('API call finalizada')
      
      successMessage.value = 'Mensalidade marcada como paga com sucesso!'
      showSuccessAlert.value = true
      
      // Recarregar dados
      console.log('Recarregando dados do store...')
      console.log('Resumo antes do reload:', mensalidadesStore.resumo)
      
      await mensalidadesStore.carregarDados()
      
      console.log('Resumo depois do reload:', mensalidadesStore.resumo)
      console.log('=== FIM MARCAR COMO PAGA ===')
      
    } catch (error) {
      console.error('Erro ao marcar como paga:', error)
      errorMessage.value = 'Erro ao marcar mensalidade como paga. Tente novamente.'
      showErrorAlert.value = true
    }
  }
}

// Carregar associados se necessário
onMounted(async () => {
  try {
    // Carregar associados primeiro se necessário
    if (associadosStore.associados.length === 0) {
      await associadosStore.fetchAssociados()
    }
    
    // Carregar dados das mensalidades
    await mensalidadesStore.carregarDados()
  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error)
  }
})

// Recarregar quando o período mudar
watch(
  () => mensalidadesStore.periodoSelecionado,
  async () => {
    try {
      // Carregar associados se necessário
      if (associadosStore.associados.length === 0) {
        await associadosStore.fetchAssociados()
      }
    } catch (error) {
      console.error('Erro ao carregar associados:', error)
    }
  },
  { deep: true }
)
</script>