import { BaseApiService } from '../base';
import type { Users, API } from '../../../types';

/**
 * Service for user-related API calls
 */
class UserService extends BaseApiService {
  /**
   * Get a user by ID
   * @param userId User ID
   * @returns Promise with the user details
   */
  async getUser(userId: string): Promise<Users.Public> {
    return this.get<Users.Public>(`/users/${userId}`);
  }

  /**
   * Update the current user's profile
   * @param data User data to update
   * @returns Promise with the updated user
   */
  async updateUser(data: API.UserUpdateRequest): Promise<Users.User> {
    return this.put<Users.User>('/users/me', data);
  }

  /**
   * Delete the current user's account
   * @returns Promise indicating success
   */
  async deleteAccount(): Promise<API.SuccessResponse> {
    return this.delete<API.SuccessResponse>('/users/me');
  }

  /**
   * Change the current user's password
   * @param data Current and new password
   * @returns Promise indicating success
   */
  async changePassword(data: API.PasswordChangeRequest): Promise<API.SuccessResponse> {
    return this.put<API.SuccessResponse>('/users/me/password', data);
  }

  /**
   * Search for users
   * @param query Search query
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Promise with found users
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<Users.Public[]> {
    return this.get<Users.Public[]>('/users/search', {
      params: { q: query, page, limit }
    });
  }

  /**
   * Get online users
   * @returns Promise with list of online users
   */
  async getOnlineUsers(): Promise<Users.Public[]> {
    return this.get<Users.Public[]>('/users/online');
  }

  // Social methods

  /**
   * Get users the current user is following
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Promise with list of followed users
   */
  async getFollowing(page: number = 1, limit: number = 20): Promise<Users.Public[]> {
    return this.get<Users.Public[]>('/users/me/social/following', {
      params: { page, limit }
    });
  }

  /**
   * Get users following the current user
   * @param page Page number (1-based)
   * @param limit Results per page
   * @returns Promise with list of followers
   */
  async getFollowers(page: number = 1, limit: number = 20): Promise<Users.Public[]> {
    return this.get<Users.Public[]>('/users/me/social/followers', {
      params: { page, limit }
    });
  }

  /**
   * Follow a user
   * @param userId User ID to follow
   * @returns Promise indicating success
   */
  async followUser(userId: string): Promise<API.SuccessResponse> {
    return this.post<API.SuccessResponse>(`/users/me/social/follow/${userId}`);
  }

  /**
   * Unfollow a user
   * @param userId User ID to unfollow
   * @returns Promise indicating success
   */
  async unfollowUser(userId: string): Promise<API.SuccessResponse> {
    return this.delete<API.SuccessResponse>(`/users/me/social/unfollow/${userId}`);
  }
}

// Create and export a singleton instance
export const userModule = new UserService();