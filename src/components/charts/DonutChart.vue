<template>
  <Doughnut :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

// Registrar os componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend)

// Props
interface Props {
  valorPix: number
  valorDinheiro: number
}

const props = defineProps<Props>()

// Watch para debug das mudanças nas props
watch([() => props.valorPix, () => props.valorDinheiro], ([novoPix, novoDinheiro]) => {
  console.log('DonutChart: Dados atualizados:', { pix: novoPix, dinheiro: novoDinheiro })
}, { immediate: true })

// Dados do gráfico
const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['PIX', 'Dinheiro'],
  datasets: [
    {
      data: [props.valorPix, props.valorDinheiro],
      backgroundColor: [
        '#3B82F6', // Azul para PIX
        '#10B981', // Verde para Dinheiro
      ],
      borderColor: [
        '#2563EB',
        '#059669',
      ],
      borderWidth: 2,
    }
  ]
}))

// Opções do gráfico
const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 14,
        },
        generateLabels: function(chart) {
          const data = chart.data;
          const datasets = data.datasets;
          const labels = data.labels as string[];
          
          if (datasets.length === 0 || !datasets[0].data) {
            return [];
          }
          
          const dataset = datasets[0];
          const values = dataset.data as number[];
          const total = values.reduce((a, b) => a + b, 0);
          
          return labels.map((label, i) => {
            const value = values[i];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            
            return {
              text: `${label} - R$ ${value.toFixed(2).replace('.', ',')} (${percentage}%)`,
              fillStyle: dataset.backgroundColor ? 
                (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : dataset.backgroundColor) : 
                '#000',
              strokeStyle: dataset.borderColor ? 
                (Array.isArray(dataset.borderColor) ? dataset.borderColor[i] : dataset.borderColor) : 
                '#000',
              lineWidth: typeof dataset.borderWidth === 'number' ? dataset.borderWidth : 0,
              hidden: false,
              index: i,
              datasetIndex: 0,
              fontColor: '#374151',
              pointStyle: 'circle'
            }
          })
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: R$ ${value.toFixed(2).replace('.', ',')} (${percentage}%)`;
        }
      }
    }
  },
  elements: {
    arc: {
      borderWidth: 2
    }
  },
  cutout: '60%' // Isso torna o gráfico em formato de rosca
}
</script>