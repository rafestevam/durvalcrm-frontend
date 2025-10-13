/**
 * Example Component Test: AssociadoForm
 *
 * This test demonstrates:
 * - Component rendering and interaction testing
 * - Form validation testing
 * - Event emission testing
 * - Using Testing Library best practices
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { createMockAssociado } from '@/test/utils/mockFactories'
import type { Associado } from '@/types'

// Mock component (for demonstration - actual component would be imported)
const MockAssociadoForm = {
  name: 'AssociadoForm',
  props: {
    associado: {
      type: Object as () => Associado | null,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit', 'cancel'],
  template: `
    <form @submit.prevent="handleSubmit" data-testid="associado-form">
      <div>
        <label for="nome">Nome Completo</label>
        <input
          id="nome"
          v-model="formData.nomeCompleto"
          :readonly="readonly"
          data-testid="input-nome"
          required
        />
      </div>

      <div>
        <label for="cpf">CPF</label>
        <input
          id="cpf"
          v-model="formData.cpf"
          :readonly="readonly"
          data-testid="input-cpf"
          required
        />
      </div>

      <div>
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          v-model="formData.email"
          :readonly="readonly"
          data-testid="input-email"
        />
      </div>

      <div>
        <label for="telefone">Telefone</label>
        <input
          id="telefone"
          v-model="formData.telefone"
          :readonly="readonly"
          data-testid="input-telefone"
        />
      </div>

      <div v-if="!readonly">
        <button type="submit" data-testid="btn-submit">Salvar</button>
        <button type="button" @click="$emit('cancel')" data-testid="btn-cancel">
          Cancelar
        </button>
      </div>
    </form>
  `,
  data() {
    return {
      formData: {
        nomeCompleto: this.associado?.nomeCompleto || '',
        cpf: this.associado?.cpf || '',
        email: this.associado?.email || '',
        telefone: this.associado?.telefone || '',
        ativo: this.associado?.ativo ?? true
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.formData })
    }
  }
}

describe('AssociadoForm Component', () => {
  describe('Renderização', () => {
    it('deve renderizar formulário vazio para novo associado', () => {
      render(MockAssociadoForm)

      expect(screen.getByTestId('input-nome')).toHaveValue('')
      expect(screen.getByTestId('input-cpf')).toHaveValue('')
      expect(screen.getByTestId('input-email')).toHaveValue('')
      expect(screen.getByTestId('input-telefone')).toHaveValue('')
    })

    it('deve renderizar formulário com dados do associado para edição', () => {
      const associado = createMockAssociado({
        nomeCompleto: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        telefone: '(11) 98765-4321'
      })

      render(MockAssociadoForm, {
        props: { associado }
      })

      expect(screen.getByTestId('input-nome')).toHaveValue('João Silva')
      expect(screen.getByTestId('input-cpf')).toHaveValue('123.456.789-00')
      expect(screen.getByTestId('input-email')).toHaveValue('joao@example.com')
      expect(screen.getByTestId('input-telefone')).toHaveValue('(11) 98765-4321')
    })

    it('deve renderizar campos como readonly quando especificado', () => {
      render(MockAssociadoForm, {
        props: { readonly: true }
      })

      expect(screen.getByTestId('input-nome')).toHaveAttribute('readonly')
      expect(screen.getByTestId('input-cpf')).toHaveAttribute('readonly')
      expect(screen.getByTestId('input-email')).toHaveAttribute('readonly')
      expect(screen.getByTestId('input-telefone')).toHaveAttribute('readonly')
      expect(screen.queryByTestId('btn-submit')).not.toBeInTheDocument()
    })
  })

  describe('Interações do Usuário', () => {
    it('deve permitir preencher todos os campos', async () => {
      render(MockAssociadoForm)

      const nomeInput = screen.getByTestId('input-nome')
      const cpfInput = screen.getByTestId('input-cpf')
      const emailInput = screen.getByTestId('input-email')
      const telefoneInput = screen.getByTestId('input-telefone')

      await fireEvent.update(nomeInput, 'Maria Santos')
      await fireEvent.update(cpfInput, '987.654.321-00')
      await fireEvent.update(emailInput, 'maria@example.com')
      await fireEvent.update(telefoneInput, '(21) 91234-5678')

      expect(nomeInput).toHaveValue('Maria Santos')
      expect(cpfInput).toHaveValue('987.654.321-00')
      expect(emailInput).toHaveValue('maria@example.com')
      expect(telefoneInput).toHaveValue('(21) 91234-5678')
    })

    it('deve emitir evento submit com dados do formulário', async () => {
      const { emitted } = render(MockAssociadoForm)

      await fireEvent.update(screen.getByTestId('input-nome'), 'João Silva')
      await fireEvent.update(screen.getByTestId('input-cpf'), '123.456.789-00')
      await fireEvent.click(screen.getByTestId('btn-submit'))

      await waitFor(() => {
        expect(emitted()).toHaveProperty('submit')
      })

      const submitEvents = emitted().submit
      expect(submitEvents).toHaveLength(1)
      expect(submitEvents[0][0]).toMatchObject({
        nomeCompleto: 'João Silva',
        cpf: '123.456.789-00'
      })
    })

    it('deve emitir evento cancel quando botão cancelar é clicado', async () => {
      const { emitted } = render(MockAssociadoForm)

      await fireEvent.click(screen.getByTestId('btn-cancel'))

      await waitFor(() => {
        expect(emitted()).toHaveProperty('cancel')
      })

      expect(emitted().cancel).toHaveLength(1)
    })
  })

  describe('Validação', () => {
    it('deve exigir nome completo', () => {
      render(MockAssociadoForm)

      const nomeInput = screen.getByTestId('input-nome')
      expect(nomeInput).toHaveAttribute('required')
    })

    it('deve exigir CPF', () => {
      render(MockAssociadoForm)

      const cpfInput = screen.getByTestId('input-cpf')
      expect(cpfInput).toHaveAttribute('required')
    })

    it('deve validar formato de email', () => {
      render(MockAssociadoForm)

      const emailInput = screen.getByTestId('input-email')
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })
})
