import { defineStore } from 'pinia'
import { ref } from 'vue'
import { receitaService } from '@/services/receitaService'
import type { Receita, ReceitaForm, TipoReceita } from '@/services/types'

export const useReceitaStore = defineStore('receita', () => {
  // Estado
  const receitas = ref<Receita[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchReceitas() {
    try {
      isLoading.value = true
      error.value = null
      const data = await receitaService.findAll()
      receitas.value = data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar receitas'
      console.error('Erro ao buscar receitas:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReceitasPorPeriodo(inicio: string, fim: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await receitaService.findByPeriodo(inicio, fim)
      receitas.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar receitas por período'
      console.error('Erro ao buscar receitas por período:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReceitasPorTipo(tipo: TipoReceita) {
    try {
      isLoading.value = true
      error.value = null
      const data = await receitaService.findByTipo(tipo)
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar receitas por tipo'
      console.error('Erro ao buscar receitas por tipo:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReceitasPorCategoria(categoriaId: string) {
    try {
      isLoading.value = true
      error.value = null
      const data = await receitaService.findByCategoria(categoriaId)
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar receitas por categoria'
      console.error('Erro ao buscar receitas por categoria:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createReceita(receita: ReceitaForm) {
    try {
      isLoading.value = true
      error.value = null
      const novaReceita = await receitaService.create(receita)
      receitas.value.push(novaReceita)
      return novaReceita
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar receita'
      console.error('Erro ao criar receita:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateReceita(id: string, receita: Partial<ReceitaForm>) {
    try {
      isLoading.value = true
      error.value = null
      const receitaAtualizada = await receitaService.update(id, receita)

      const index = receitas.value.findIndex(r => r.id === id)
      if (index !== -1) {
        receitas.value[index] = receitaAtualizada
      }

      return receitaAtualizada
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar receita'
      console.error('Erro ao atualizar receita:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteReceita(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await receitaService.delete(id)

      const index = receitas.value.findIndex(r => r.id === id)
      if (index !== -1) {
        receitas.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao deletar receita'
      console.error('Erro ao deletar receita:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Estado
    receitas,
    isLoading,
    error,

    // Actions
    fetchReceitas,
    fetchReceitasPorPeriodo,
    fetchReceitasPorTipo,
    fetchReceitasPorCategoria,
    createReceita,
    updateReceita,
    deleteReceita,
  }
})
