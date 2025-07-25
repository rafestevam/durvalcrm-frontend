import { expect, afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import '@testing-library/jest-dom'

// runs a cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup()
})

// Global test configuration
expect.extend({})

// Mock do console para evitar logs desnecessários durante os testes
const originalConsole = { ...console }
beforeEach(() => {
  console.warn = vi.fn()
  console.error = vi.fn()
})

afterEach(() => {
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})