/**
 * Test Helper Utilities
 * Common utilities for component and integration testing
 */

import { vi } from 'vitest'
import type { Router } from 'vue-router'
import { createRouter, createMemoryHistory } from 'vue-router'

/**
 * Creates a mock router for testing
 */
export function createMockRouter(routes: any[] = []): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: routes.length > 0 ? routes : [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } }
    ]
  })
}

/**
 * Waits for the next tick and any pending promises
 */
export async function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

/**
 * Waits for a specific amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Creates a mock localStorage implementation
 */
export function createMockLocalStorage() {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
}

/**
 * Creates a mock sessionStorage implementation
 */
export function createMockSessionStorage() {
  return createMockLocalStorage() // Same implementation
}

/**
 * Setup mock storage for tests
 */
export function setupMockStorage() {
  const localStorage = createMockLocalStorage()
  const sessionStorage = createMockSessionStorage()

  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    writable: true
  })

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorage,
    writable: true
  })

  return { localStorage, sessionStorage }
}

/**
 * Creates a mock console to suppress logs in tests
 */
export function createMockConsole() {
  return {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}

/**
 * Suppresses console output during tests
 */
export function suppressConsole() {
  const originalConsole = { ...console }
  const mockConsole = createMockConsole()

  Object.assign(console, mockConsole)

  return () => {
    Object.assign(console, originalConsole)
  }
}

/**
 * Test wrapper for async operations with error handling
 */
export async function testAsync<T>(
  operation: () => Promise<T>,
  onError?: (error: any) => void
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    if (onError) {
      onError(error)
    }
    return null
  }
}

/**
 * Simulates user typing in an input field
 */
export async function typeInInput(input: HTMLInputElement, text: string) {
  input.focus()
  for (const char of text) {
    input.value += char
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()
  }
  input.blur()
}

/**
 * Simulates form submission
 */
export async function submitForm(form: HTMLFormElement) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  await flushPromises()
}

/**
 * Query selectors helpers
 */
export const query = {
  getByTestId: (testId: string): HTMLElement | null => {
    return document.querySelector(`[data-testid="${testId}"]`)
  },
  getAllByTestId: (testId: string): HTMLElement[] => {
    return Array.from(document.querySelectorAll(`[data-testid="${testId}"]`))
  },
  getByRole: (role: string): HTMLElement | null => {
    return document.querySelector(`[role="${role}"]`)
  },
  getAllByRole: (role: string): HTMLElement[] => {
    return Array.from(document.querySelectorAll(`[role="${role}"]`))
  }
}
