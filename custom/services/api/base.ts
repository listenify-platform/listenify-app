import { _getAppConfig } from '#app';
import { userStorage } from '../../storage';
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

/**
 * Base API service with common functionality
 */
const config = _getAppConfig();

export class BaseApiService {
  protected axios: AxiosInstance;
  protected baseUrl: string = `${location.protocol}//${config.API_URL}`;

  constructor() {
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to add auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = userStorage.has('access_token') ? userStorage.get('access_token') : null;
        if (typeof token === 'string')
          config.headers['Authorization'] = `Bearer ${token}`;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle token expiration
        if (error.response?.status === 401)
          userStorage.set('access_token', null);
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set auth token for API requests
   * @param token The auth token
   */
  public setAuthToken(token: string | null): void {
    userStorage.set('access_token', token);
    this.axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  }

  /**
   * Get data from an endpoint
   * @param url The endpoint URL
   * @param config Additional Axios request config
   * @returns Promise with the response data
   */
  protected async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Send data to an endpoint using POST
   * @param url The endpoint URL
   * @param data The data to send
   * @param config Additional Axios request config
   * @returns Promise with the response data
   */
  protected async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update data at an endpoint using PUT
   * @param url The endpoint URL
   * @param data The data to update
   * @param config Additional Axios request config
   * @returns Promise with the response data
   */
  protected async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete data at an endpoint
   * @param url The endpoint URL
   * @param config Additional Axios request config
   * @returns Promise with the response data
   */
  protected async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param error The error object
   */
  protected handleError(error: any): never {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data.error?.message || 'An error occurred';
      const errorCode = error.response.status;
      throw new ApiError(errorMessage, errorCode, error.response.data?.error);
    } else if (error.request) {
      // The request was made but no response was received
      throw new ApiError('No response from server', 0);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new ApiError(error.message || 'Request failed', 0);
    }
  }
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    
    // This is necessary for TypeScript to correctly work with custom Error classes
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}