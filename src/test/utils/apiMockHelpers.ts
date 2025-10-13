/**
 * API Mock Helpers
 * Utilities for mocking API responses in tests using axios-mock-adapter
 */

import MockAdapter from 'axios-mock-adapter'
import type { AxiosInstance } from 'axios'

/**
 * Creates a mock adapter for axios with default configuration
 */
export function createMockAdapter(axiosInstance: AxiosInstance, options?: { delayResponse?: number }) {
  return new MockAdapter(axiosInstance, {
    delayResponse: options?.delayResponse ?? 0,
    onNoMatch: 'throwException'
  })
}

/**
 * Mock response types
 */
export interface MockSuccessResponse<T = any> {
  data: T
  status?: number
}

export interface MockErrorResponse {
  message: string
  status?: number
  code?: string
}

/**
 * Creates a successful mock response
 */
export function mockSuccess<T>(data: T, status: number = 200): MockSuccessResponse<T> {
  return { data, status }
}

/**
 * Creates an error mock response
 */
export function mockError(message: string, status: number = 500, code?: string): MockErrorResponse {
  return { message, status, code }
}

/**
 * Mock API response handlers
 */
export class MockApiHelper {
  constructor(private mockAdapter: MockAdapter) {}

  /**
   * Mocks a GET request with success response
   */
  onGet(url: string | RegExp, response: any, status: number = 200) {
    this.mockAdapter.onGet(url).reply(status, response)
    return this
  }

  /**
   * Mocks a POST request with success response
   */
  onPost(url: string | RegExp, response: any, status: number = 201) {
    this.mockAdapter.onPost(url).reply(status, response)
    return this
  }

  /**
   * Mocks a PUT request with success response
   */
  onPut(url: string | RegExp, response: any, status: number = 200) {
    this.mockAdapter.onPut(url).reply(status, response)
    return this
  }

  /**
   * Mocks a DELETE request with success response
   */
  onDelete(url: string | RegExp, status: number = 204) {
    this.mockAdapter.onDelete(url).reply(status)
    return this
  }

  /**
   * Mocks a request that returns an error
   */
  onError(method: 'get' | 'post' | 'put' | 'delete', url: string | RegExp, status: number = 500, message: string = 'Internal Server Error') {
    const methodMap = {
      get: this.mockAdapter.onGet,
      post: this.mockAdapter.onPost,
      put: this.mockAdapter.onPut,
      delete: this.mockAdapter.onDelete
    }

    methodMap[method].call(this.mockAdapter, url).reply(status, { message })
    return this
  }

  /**
   * Mocks network error
   */
  onNetworkError(method: 'get' | 'post' | 'put' | 'delete', url: string | RegExp) {
    const methodMap = {
      get: this.mockAdapter.onGet,
      post: this.mockAdapter.onPost,
      put: this.mockAdapter.onPut,
      delete: this.mockAdapter.onDelete
    }

    methodMap[method].call(this.mockAdapter, url).networkError()
    return this
  }

  /**
   * Mocks timeout error
   */
  onTimeout(method: 'get' | 'post' | 'put' | 'delete', url: string | RegExp) {
    const methodMap = {
      get: this.mockAdapter.onGet,
      post: this.mockAdapter.onPost,
      put: this.mockAdapter.onPut,
      delete: this.mockAdapter.onDelete
    }

    methodMap[method].call(this.mockAdapter, url).timeout()
    return this
  }

  /**
   * Resets all mocks
   */
  reset() {
    this.mockAdapter.reset()
    return this
  }

  /**
   * Restores the axios instance to its original state
   */
  restore() {
    this.mockAdapter.restore()
  }
}

/**
 * Creates a MockApiHelper instance
 */
export function createMockApiHelper(axiosInstance: AxiosInstance, options?: { delayResponse?: number }): MockApiHelper {
  const mockAdapter = createMockAdapter(axiosInstance, options)
  return new MockApiHelper(mockAdapter)
}
