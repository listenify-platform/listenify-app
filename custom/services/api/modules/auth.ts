import { BaseApiService } from '../base';
import type { API, Users } from '../../../types';

/**
 * Service for authentication related API calls
 */
class AuthModule extends BaseApiService {
  /**
   * Register a new user
   * @param data Registration details
   * @returns Promise with the new user and token
   */
  async register(data: API.RegisterRequest): Promise<API.RegisterResponse> {
    const response = await this.post<API.RegisterResponse>('/auth/register', data);
    this.setAuthToken(response.token);
    return response;
  }

  /**
   * Log in with email and password
   * @param data Login credentials
   * @returns Promise with the user and token
   */
  async login(data: API.LoginRequest): Promise<API.LoginResponse> {
    const response = await this.post<API.LoginResponse>('/auth/login', data);
    this.setAuthToken(response.token);
    return response;
  }

  /**
   * Log out the current user
   * @returns Promise indicating success
   */
  async logout(): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>('/auth/logout');
    this.setAuthToken(null);
    return response;
  }

  /**
   * Refresh the authentication token
   * @returns Promise with the new token
   */
  async refreshToken(): Promise<API.RefreshResponse> {
    const response = await this.post<API.RefreshResponse>('/auth/refresh');
    this.setAuthToken(response.token);
    return response;
  }

  /**
   * Get the current user's profile
   * @returns Promise with the user details
   */
  async getCurrentUser(): Promise<Users.User> {
    return this.get<Users.User>('/users/me');
  }
}

// Create and export a singleton instance
export const authModule: AuthModule = new AuthModule();