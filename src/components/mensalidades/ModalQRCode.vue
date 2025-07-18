<template>
  <BaseModal :show="show" @close="$emit('close')" size="sm">
    <template #title>
      QR Code PIX
    </template>
    
    <template #default>
      <div v-if="mensalidade" class="text-center space-y-4">
        <!-- Informações da Mensalidade -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h3 class="font-medium text-gray-900">{{ mensalidade.nomeAssociado }}</h3>
          <p class="text-sm text-gray-600">
            {{ formatters.money(mensalidade.valor) }} - {{ periodoFormatado }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Vencimento: {{ formatters.date(mensalidade.dataVencimento) }}
          </p>
        </div>

        <!-- QR Code -->
        <div class="flex justify-center">
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-sm text-gray-600 mt-2">Gerando QR Code...</p>
          </div>
          <div v-else-if="error" class="text-center py-8">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
          <div v-else class="bg-white p-4 rounded-lg border-2 border-gray-200">
            <canvas ref="qrCanvas" class="mx-auto"></canvas>
          </div>
        </div>

        <!-- Código PIX para copiar -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Código PIX:
          </label>
          <div class="flex">
            <input
              ref="pixCodeInput"
              :value="qrCodeData"
              readonly
              class="flex-1 rounded-l-md border-gray-300 text-xs font-mono bg-gray-50"
            />
            <button
              @click="copiarCodigo"
              class="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {{ copiado ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Instruções -->
        <div class="bg-blue-50 rounded-md p-3">
          <div class="text-sm text-blue-800">
            <p class="font-medium">Como usar:</p>
            <ul class="mt-1 text-xs space-y-1">
              <li>• Abra o app do seu banco</li>
              <li>• Escolha "PIX" → "Pagar com QR Code"</li>
              <li>• Aponte a câmera para o código acima</li>
              <li>• Ou copie o código PIX e cole no app</li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <BaseButton variant="secondary" @click="$emit('close')">
          Fechar
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatters } from '@/utils/formatters'
import { mensalidadeService } from '@/services/mensalidade'
import type { Mensalidade } from '@/services/types'

interface Props {
  show: boolean
  mensalidade: Mensalidade | null
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const qrCanvas = ref<HTMLCanvasElement>()
const pixCodeInput = ref<HTMLInputElement>()
const copiado = ref(false)
const loading = ref(false)
const error = ref('')
const qrCodeData = ref('')

const periodoFormatado = computed(() => {
  if (!props.mensalidade) return ''
  const meses = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
  return `${meses[props.mensalidade.mesReferencia - 1]}/${props.mensalidade.anoReferencia}`
})

async function buscarQRCode() {
  if (!props.mensalidade?.id) return
  
  loading.value = true
  error.value = ''
  
  try {
    // Se a mensalidade já tem QR Code, usar ele
    if (props.mensalidade.qrCodePix) {
      qrCodeData.value = props.mensalidade.qrCodePix
    } else {
      // Buscar QR Code via API
      console.log('Buscando QR Code via API para mensalidade:', props.mensalidade.id)
      qrCodeData.value = await mensalidadeService.obterQRCode(props.mensalidade.id)
    }
    
    await nextTick()
    await gerarQRCode()
    
  } catch (err) {
    console.error('Erro ao buscar QR Code:', err)
    error.value = 'QR Code não disponível para esta mensalidade'
  } finally {
    loading.value = false
  }
}

async function gerarQRCode() {
  console.log('Gerando QR Code...')
  console.log('QR Code Data:', qrCodeData.value)
  console.log('Canvas:', qrCanvas.value)
  
  if (!qrCodeData.value || !qrCanvas.value) {
    console.error('QR Code data ou canvas não disponível')
    return
  }

  try {
    const QRCode = await import('qrcode')
    console.log('QRCode library loaded:', QRCode)
    
    await QRCode.toCanvas(qrCanvas.value, qrCodeData.value, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    console.log('QR Code gerado com sucesso')
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error)
    error.value = 'Erro ao gerar QR Code'
  }
}

async function copiarCodigo() {
  if (!qrCodeData.value) return

  try {
    await navigator.clipboard.writeText(qrCodeData.value)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (error) {
    // Fallback para browsers mais antigos
    pixCodeInput.value?.select()
    document.execCommand('copy')
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  }
}

watch(() => props.show, async (show) => {
  if (show && props.mensalidade) {
    await nextTick()
    buscarQRCode()
  }
})
</script>