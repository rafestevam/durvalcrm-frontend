import { describe, it, expect } from 'vitest'
import { validators, validationMessages } from '../validators'

describe('validators', () => {
  describe('required', () => {
    it('validates required fields correctly', () => {
      expect(validators.required('test')).toBe(true)
      expect(validators.required('0')).toBe(true)
      expect(validators.required(false)).toBe(true)
      expect(validators.required(0)).toBe(true)
      
      expect(validators.required('')).toBe(false)
      expect(validators.required(null)).toBe(false)
      expect(validators.required(undefined)).toBe(false)
    })

    it('validates arrays correctly', () => {
      expect(validators.required(['item'])).toBe(true)
      expect(validators.required([])).toBe(false)
    })
  })

  describe('email', () => {
    it('validates correct email addresses', () => {
      expect(validators.email('test@example.com')).toBe(true)
      expect(validators.email('user.name@domain.co.uk')).toBe(true)
      expect(validators.email('user+tag@example.org')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validators.email('invalid-email')).toBe(false)
      expect(validators.email('user@')).toBe(false)
      expect(validators.email('@domain.com')).toBe(false)
      expect(validators.email('user space@domain.com')).toBe(false)
      expect(validators.email('')).toBe(false)
    })
  })

  describe('cpf', () => {
    it('validates correctly formatted CPF', () => {
      expect(validators.cpf('123.456.789-01')).toBe(true)
      expect(validators.cpf('000.000.000-00')).toBe(true)
      expect(validators.cpf('999.999.999-99')).toBe(true)
    })

    it('rejects incorrectly formatted CPF', () => {
      expect(validators.cpf('12345678901')).toBe(false)
      expect(validators.cpf('123.456.789.01')).toBe(false)
      expect(validators.cpf('123-456-789-01')).toBe(false)
      expect(validators.cpf('123.456.78-01')).toBe(false)
      expect(validators.cpf('123.456.789-1')).toBe(false)
      expect(validators.cpf('')).toBe(false)
    })
  })

  describe('phone', () => {
    it('validates correctly formatted phone numbers', () => {
      expect(validators.phone('(11) 99999-9999')).toBe(true)
      expect(validators.phone('(11) 9999-9999')).toBe(true)
      expect(validators.phone('(21) 12345-6789')).toBe(true)
    })

    it('rejects incorrectly formatted phone numbers', () => {
      expect(validators.phone('11999999999')).toBe(false)
      expect(validators.phone('11 99999-9999')).toBe(false)
      expect(validators.phone('(11) 999999999')).toBe(false)
      expect(validators.phone('(11) 9999-99999')).toBe(false)
      expect(validators.phone('(1) 9999-9999')).toBe(false)
      expect(validators.phone('')).toBe(false)
    })
  })

  describe('minLength', () => {
    it('validates minimum length correctly', () => {
      const minLength5 = validators.minLength(5)
      
      expect(minLength5('12345')).toBe(true)
      expect(minLength5('123456')).toBe(true)
      expect(minLength5('1234')).toBe(false)
      expect(minLength5('')).toBe(false)
    })

    it('works with different minimum lengths', () => {
      expect(validators.minLength(0)('')).toBe(true)
      expect(validators.minLength(1)('a')).toBe(true)
      expect(validators.minLength(10)('short')).toBe(false)
    })
  })

  describe('maxLength', () => {
    it('validates maximum length correctly', () => {
      const maxLength5 = validators.maxLength(5)
      
      expect(maxLength5('12345')).toBe(true)
      expect(maxLength5('1234')).toBe(true)
      expect(maxLength5('123456')).toBe(false)
      expect(maxLength5('')).toBe(true)
    })

    it('works with different maximum lengths', () => {
      expect(validators.maxLength(0)('')).toBe(true)
      expect(validators.maxLength(0)('a')).toBe(false)
      expect(validators.maxLength(100)('normal text')).toBe(true)
    })
  })
})

describe('validationMessages', () => {
  it('provides correct static messages', () => {
    expect(validationMessages.required).toBe('Este campo é obrigatório')
    expect(validationMessages.email).toBe('Digite um e-mail válido')
    expect(validationMessages.cpf).toBe('Digite um CPF válido (000.000.000-00)')
    expect(validationMessages.phone).toBe('Digite um telefone válido ((00) 00000-0000)')
  })

  it('provides correct dynamic messages', () => {
    expect(validationMessages.minLength(5)).toBe('Mínimo de 5 caracteres')
    expect(validationMessages.maxLength(10)).toBe('Máximo de 10 caracteres')
    expect(validationMessages.minLength(1)).toBe('Mínimo de 1 caracteres')
  })
})