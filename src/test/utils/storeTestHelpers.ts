/**
 * Pinia Store Test Helpers
 * Utilities for testing Pinia stores in isolation
 */

import { setActivePinia, createPinia } from 'pinia'
import { vi, expect } from 'vitest'

/**
 * Creates and activates a fresh Pinia instance for testing
 */
export function setupTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Creates a mock Pinia store for testing
 */
export function createMockStore<T extends Record<string, any>>(
  storeName: string,
  initialState: Partial<T> = {},
  actions: Record<string, any> = {}
) {
  const state = { ...initialState }
  const mockedActions: Record<string, any> = {}

  // Create vi.fn() for each action
  Object.keys(actions).forEach((actionName) => {
    mockedActions[actionName] = vi.fn(actions[actionName])
  })

  return {
    $id: storeName,
    ...state,
    ...mockedActions,
    $patch: vi.fn((updates: Partial<T>) => {
      Object.assign(state, updates)
    }),
    $reset: vi.fn(() => {
      Object.assign(state, initialState)
    }),
    $subscribe: vi.fn(),
    $dispose: vi.fn()
  }
}

/**
 * Waits for store actions to complete
 */
export async function waitForStoreAction(
  action: () => Promise<any>,
  timeout: number = 1000
): Promise<void> {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Store action timeout')), timeout)
  })

  try {
    await Promise.race([action(), timeoutPromise])
  } catch (error) {
    throw error
  }
}

/**
 * Spy on store action calls
 */
export function spyOnStoreAction(
  store: any,
  actionName: string
) {
  return vi.spyOn(store, actionName)
}

/**
 * Mock store state snapshot
 */
export function createStoreSnapshot<T>(state: T): T {
  return JSON.parse(JSON.stringify(state))
}

/**
 * Assert store state changes
 */
export function assertStoreState<T>(
  store: any,
  expectedState: Partial<T>
) {
  Object.keys(expectedState).forEach((key) => {
    expect(store[key]).toEqual(expectedState[key as keyof T])
  })
}
