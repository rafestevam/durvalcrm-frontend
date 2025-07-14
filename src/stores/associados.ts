import { defineStore } from 'pinia'
import { ref } from 'vue'
import { associadosService } from '@/services/associados'
import type { Associado } from '@/services/types'

export const useAssociadosStore = defineStore('associados', () => {
  // Estado
  const associados = ref<Associado[]>([])
  const isLoading = ref(false)
  const searchQuery = ref('')

  // Actions
  async function fetchAssociados(search?: string) {
    try {
      isLoading.value = true
      const data = await associadosService.findAll(search)
      associados.value = data
    } catch (error) {
      console.error('Erro ao buscar associados:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function createAssociado(associado: Omit<Associado, 'id'>) {
    try {
      isLoading.value = true
      const novoAssociado = await associadosService.create(associado)
      associados.value.push(novoAssociado)
      return novoAssociado
    } catch (error) {
      console.error('Erro ao criar associado:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateAssociado(id: string, associado: Partial<Associado>) {
    try {
      isLoading.value = true
      const associadoAtualizado = await associadosService.update(id, associado)
      
      const index = associados.value.findIndex(a => a.id === id)
      if (index !== -1) {
        associados.value[index] = associadoAtualizado
      }
      
      return associadoAtualizado
    } catch (error) {
      console.error('Erro ao atualizar associado:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAssociado(id: string) {
    try {
      isLoading.value = true
      await associadosService.delete(id)
      
      const index = associados.value.findIndex(a => a.id === id)
      if (index !== -1) {
        associados.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Erro ao deletar associado:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  return {
    // Estado
    associados,
    isLoading,
    searchQuery,
    
    // Actions
    fetchAssociados,
    createAssociado,
    updateAssociado,
    deleteAssociado,
    setSearchQuery,
  }
})
