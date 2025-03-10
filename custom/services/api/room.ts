import type { Rooms } from '~/custom/types';
import { BaseApiService } from './base';

/**
 * Service for room-related API calls
 */
class RoomService extends BaseApiService {
  /**
   * Get active rooms
   * @param limit Maximum number of rooms to return
   * @returns Promise with the list of active rooms
   */
  async getActiveRooms(limit: number = 20): Promise<Rooms.Room[]> {
    return this.get<Rooms.Room[]>(`/rooms?limit=${limit}`);
  }

  /**
   * Get popular rooms
   * @param limit Maximum number of rooms to return
   * @returns Promise with the list of popular rooms
   */
  async getPopularRooms(limit: number = 20): Promise<Rooms.Room[]> {
    return this.get<Rooms.Room[]>(`/rooms/popular?limit=${limit}`);
  }

  /**
   * Get favorite rooms
   * @param limit Maximum number of rooms to return
   * @returns Promise with the list of favorite rooms
   */
  async getFavoriteRooms(limit: number = 20): Promise<Rooms.Room[]> {
    return this.get<Rooms.Room[]>(`/rooms/favorites?limit=${limit}`);
  }

  /**
   * Search for rooms
   * @param query Search query
   * @param limit Maximum number of rooms to return
   * @param page Page number (for pagination)
   * @returns Promise with search results
   */
  async searchRooms(query: string, limit: number = 20, page: number = 0): Promise<{rooms: Rooms.Room[], total: number}> {
    return this.get<{rooms: Rooms.Room[], total: number}>(`/rooms/search`, {
      params: { query, limit, skip: page }
    });
  }

  /**
   * Get a room by ID
   * @param roomId Room ID
   * @returns Promise with the room
   */
  async getRoomById(roomId: string): Promise<Rooms.Room> {
    return this.get<Rooms.Room>(`/rooms/${roomId}`);
  }

  /**
   * Get a room by slug
   * @param slug Room slug
   * @returns Promise with the room
   */
  async getRoomBySlug(slug: string): Promise<Rooms.Room> {
    return this.get<Rooms.Room>(`/rooms/by-slug/${slug}`);
  }

  /**
   * Get the current state of a room
   * @param roomId Room ID
   * @returns Promise with the room state
   */
  async getRoomState(roomId: string): Promise<Rooms.State> {
    return this.get<Rooms.State>(`/rooms/${roomId}/state`);
  }

  /**
   * Check if a user is in a room
   * @param roomId Room ID
   * @param userId User ID (optional, defaults to current user)
   * @returns Promise with whether the user is in the room
   */
  async isUserInRoom(roomId: string, userId?: string): Promise<{inRoom: boolean}> {
    const params = userId ? { userId } : {};
    return this.get<{inRoom: boolean}>(`/rooms/${roomId}/user`, { params });
  }

  /**
   * Create a new room
   * @param data Room creation data
   * @returns Promise with the created room
   */
  async createRoom(data: {
    name: string;
    description: string;
    slug: string;
    settings: Partial<Rooms.Settings>;
  }): Promise<Rooms.Room> {
    return this.post<Rooms.Room>('/rooms', data);
  }

  /**
   * Update a room
   * @param roomId Room ID
   * @param data Room update data
   * @returns Promise with the updated room
   */
  async updateRoom(roomId: string, data: {
    name: string;
    description: string;
    slug: string;
    settings: Partial<Rooms.Settings>;
  }): Promise<Rooms.Room> {
    return this.put<Rooms.Room>(`/rooms/${roomId}`, data);
  }

  /**
   * Delete a room
   * @param roomId Room ID
   * @returns Promise indicating success
   */
  async deleteRoom(roomId: string): Promise<void> {
    return this.delete<void>(`/rooms/${roomId}`);
  }
}

// Create and export a singleton instance
export const roomService = new RoomService();