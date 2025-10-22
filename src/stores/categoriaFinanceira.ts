import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriaFinanceiraService } from '@/services/categoriaFinanceiraService'
import type { CategoriaFinanceira, CategoriaFinanceiraForm, TipoCategoriaFinanceira } from '@/services/types'

export const useCategoriaFinanceiraStore = defineStore('categoriaFinanceira', () => {
  // Estado
  const categorias = ref<CategoriaFinanceira[]>([])
  const categoriasAtivas = ref<CategoriaFinanceira[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchCategorias() {
    try {
      isLoading.value = true
      error.value = null
      const data = await categoriaFinanceiraService.findAll()
      categorias.value = data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar categorias'
      console.error('Erro ao buscar categorias:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoriasAtivas() {
    try {
      isLoading.value = true
      error.value = null
      const data = await categoriaFinanceiraService.findAtivas()
      categoriasAtivas.value = data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar categorias ativas'
      console.error('Erro ao buscar categorias ativas:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoriasByTipo(tipo: TipoCategoriaFinanceira) {
    try {
      isLoading.value = true
      error.value = null
      const data = await categoriaFinanceiraService.findByTipo(tipo)
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar categorias por tipo'
      console.error('Erro ao buscar categorias por tipo:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoriasAtivasPorTipo(tipo: TipoCategoriaFinanceira) {
    try {
      isLoading.value = true
      error.value = null
      const data = await categoriaFinanceiraService.findAtivasPorTipo(tipo)
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar categorias ativas por tipo'
      console.error('Erro ao buscar categorias ativas por tipo:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createCategoria(categoria: CategoriaFinanceiraForm) {
    try {
      isLoading.value = true
      error.value = null
      const novaCategoria = await categoriaFinanceiraService.create(categoria)
      categorias.value.push(novaCategoria)
      if (novaCategoria.ativa) {
        categoriasAtivas.value.push(novaCategoria)
      }
      return novaCategoria
    } catch (err: any) {
      error.value = err.message || 'Erro ao criar categoria'
      console.error('Erro ao criar categoria:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateCategoria(id: string, categoria: Partial<CategoriaFinanceiraForm>) {
    try {
      isLoading.value = true
      error.value = null
      const categoriaAtualizada = await categoriaFinanceiraService.update(id, categoria)

      const index = categorias.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categorias.value[index] = categoriaAtualizada
      }

      const indexAtiva = categoriasAtivas.value.findIndex(c => c.id === id)
      if (categoriaAtualizada.ativa && indexAtiva === -1) {
        categoriasAtivas.value.push(categoriaAtualizada)
      } else if (!categoriaAtualizada.ativa && indexAtiva !== -1) {
        categoriasAtivas.value.splice(indexAtiva, 1)
      } else if (indexAtiva !== -1) {
        categoriasAtivas.value[indexAtiva] = categoriaAtualizada
      }

      return categoriaAtualizada
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar categoria'
      console.error('Erro ao atualizar categoria:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function desativarCategoria(id: string) {
    try {
      isLoading.value = true
      error.value = null
      await categoriaFinanceiraService.desativar(id)

      const index = categorias.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categorias.value[index].ativa = false
      }

      const indexAtiva = categoriasAtivas.value.findIndex(c => c.id === id)
      if (indexAtiva !== -1) {
        categoriasAtivas.value.splice(indexAtiva, 1)
      }
    } catch (err: any) {
      error.value = err.message || 'Erro ao desativar categoria'
      console.error('Erro ao desativar categoria:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function reativarCategoria(id: string) {
    try {
      isLoading.value = true
      error.value = null
      const categoriaReativada = await categoriaFinanceiraService.reativar(id)

      const index = categorias.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categorias.value[index] = categoriaReativada
      }

      if (categoriaReativada.ativa) {
        categoriasAtivas.value.push(categoriaReativada)
      }

      return categoriaReativada
    } catch (err: any) {
      error.value = err.message || 'Erro ao reativar categoria'
      console.error('Erro ao reativar categoria:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Estado
    categorias,
    categoriasAtivas,
    isLoading,
    error,

    // Actions
    fetchCategorias,
    fetchCategoriasAtivas,
    fetchCategoriasByTipo,
    fetchCategoriasAtivasPorTipo,
    createCategoria,
    updateCategoria,
    desativarCategoria,
    reativarCategoria,
  }
})
