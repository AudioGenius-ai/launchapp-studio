import { invoke } from '@tauri-apps/api/core';

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * API error interface
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * API client for making HTTP requests through Tauri
 * Provides a consistent interface for backend communication
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  
  constructor(
    baseUrl: string = '',
    defaultHeaders: Record<string, string> = {},
    timeout: number = 30000
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
    this.timeout = timeout;
  }
  
  /**
   * Make an HTTP request
   */
  async request<T = any>(
    endpoint: string, 
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout
    } = config;
    
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers
    };
    
    try {
      const response = await invoke<{
        data: T;
        status: number;
        statusText: string;
        headers: Record<string, string>;
      }>('plugin:http|request', {
        url,
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        timeout
      });
      
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
  
  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string, 
    config: Omit<ApiRequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }
  
  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string, 
    body?: any,
    config: Omit<ApiRequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }
  
  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string, 
    body?: any,
    config: Omit<ApiRequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }
  
  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string, 
    body?: any,
    config: Omit<ApiRequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
  
  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    config: Omit<ApiRequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
  
  /**
   * Set default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
  
  /**
   * Set authorization header
   */
  setAuthToken(token: string, type: string = 'Bearer'): void {
    this.setDefaultHeaders({ Authorization: `${type} ${token}` });
  }
  
  /**
   * Remove authorization header
   */
  removeAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }
  
  /**
   * Set base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }
  
  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
  
  /**
   * Set default timeout
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
  
  /**
   * Handle API errors
   */
  private handleError(error: any): ApiError {
    if (error.status) {
      return {
        message: error.message || 'API request failed',
        status: error.status,
        code: error.code,
        details: error.details
      };
    }
    
    return {
      message: error.message || 'Network error',
      code: 'NETWORK_ERROR',
      details: error
    };
  }
}

// Export a default instance
export const apiClient = new ApiClient();