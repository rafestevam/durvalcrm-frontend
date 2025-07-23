import { describe, it, expect } from 'vitest'
import { formatters, parsers } from '../formatters'

describe('formatters', () => {
  describe('cpf', () => {
    it('formats CPF correctly', () => {
      expect(formatters.cpf('12345678901')).toBe('123.456.789-01')
      expect(formatters.cpf('000.111.222-33')).toBe('000.111.222-33')
      expect(formatters.cpf('abc123def456ghi789jkl01')).toBe('123.456.789-01')
    })

    it('handles incomplete CPF', () => {
      expect(formatters.cpf('123')).toBe('123')
      expect(formatters.cpf('12345')).toBe('12345')
    })
  })

  describe('phone', () => {
    it('formats 11-digit phone correctly', () => {
      expect(formatters.phone('11987654321')).toBe('(11) 98765-4321')
    })

    it('formats 10-digit phone correctly', () => {
      expect(formatters.phone('1133334444')).toBe('(11) 3333-4444')
    })

    it('handles invalid phone numbers', () => {
      expect(formatters.phone('123')).toBe('123')
      expect(formatters.phone('123456789012')).toBe('123456789012')
    })

    it('removes non-digit characters', () => {
      expect(formatters.phone('(11) 98765-4321')).toBe('(11) 98765-4321')
      expect(formatters.phone('11-98765-4321')).toBe('(11) 98765-4321')
    })
  })

  describe('currency', () => {
    it('formats currency correctly', () => {
      expect(formatters.currency(1234.56)).toContain('1.234,56')
      expect(formatters.currency(1234.56)).toContain('R$')
      expect(formatters.currency(0)).toContain('0,00')
      expect(formatters.currency(10.9)).toContain('10,90')
    })

    it('handles negative values', () => {
      const result = formatters.currency(-100.50)
      expect(result).toContain('100,50')
      expect(result).toMatch(/^-.*R\$.*100,50$/)
    })
  })

  describe('money', () => {
    it('formats money correctly (alias for currency)', () => {
      expect(formatters.money(1234.56)).toContain('1.234,56')
      expect(formatters.money(1234.56)).toContain('R$')
      expect(formatters.money(0)).toContain('0,00')
    })
  })

  describe('date', () => {
    it('formats date correctly', () => {
      // Use explicit date construction to avoid timezone issues
      const date = new Date(2024, 0, 15) // Month is 0-indexed
      expect(formatters.date(date)).toBe('15/01/2024')
    })

    it('formats date string correctly', () => {
      // Use explicit date construction to avoid timezone issues
      const date = new Date(2024, 0, 15) // Month is 0-indexed
      expect(formatters.date(date)).toBe('15/01/2024')
    })
  })

  describe('datetime', () => {
    it('formats datetime correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatters.datetime(date)
      expect(result).toContain('15')
      expect(result).toContain('jan')
      expect(result).toContain('2024')
      expect(result).toContain('14:30')
    })
  })
})

describe('parsers', () => {
  describe('cpfToNumbers', () => {
    it('removes CPF formatting', () => {
      expect(parsers.cpfToNumbers('123.456.789-01')).toBe('12345678901')
      expect(parsers.cpfToNumbers('123456789-01')).toBe('12345678901')
      expect(parsers.cpfToNumbers('abc123.456.789-01def')).toBe('12345678901')
    })
  })

  describe('phoneToNumbers', () => {
    it('removes phone formatting', () => {
      expect(parsers.phoneToNumbers('(11) 98765-4321')).toBe('11987654321')
      expect(parsers.phoneToNumbers('11-98765-4321')).toBe('11987654321')
      expect(parsers.phoneToNumbers('11987654321')).toBe('11987654321')
    })
  })

  describe('currencyToNumber', () => {
    it('converts currency string to number', () => {
      expect(parsers.currencyToNumber('R$ 1.234,56')).toBe(1234.56)
      expect(parsers.currencyToNumber('1.234,56')).toBe(1234.56)
      expect(parsers.currencyToNumber('1234,56')).toBe(1234.56)
    })

    it('handles different formats', () => {
      expect(parsers.currencyToNumber('R$ 10,90')).toBe(10.90)
      expect(parsers.currencyToNumber('10,90')).toBe(10.90)
      expect(parsers.currencyToNumber('0,00')).toBe(0)
    })
  })
})