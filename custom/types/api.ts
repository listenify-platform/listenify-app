import type { Medias } from "./medias";
import type { Users } from "./users";


/**
 * API namespace contains all interfaces used for API requests and responses.
 * These types are used when communicating with the backend HTTP API.
 */
export namespace API {
  /**
   * Base interface for authenticated responses containing user profile and token.
   */
  export interface AuthenticatedResponse {
    /** User's public profile */
    user: Users.User;
    /** Authentication token for subsequent requests */
    token: string;
  }

  /**
   * Detailed health check response with additional information.
   */
  export interface DetailedHealthResponse extends HealthResponse {
    /** Current environment (development, production, etc.) */
    environment: string;
    /** Build information */
    buildInfo: {
      /** Application version */
      version: string;
      /** Go runtime version */
      goVersion: string;
    };
    /** Configuration status */
    configStatus: {
      /** Current environment */
      environment: string;
      /** Enabled feature flags */
      features: Record<string, boolean>;
      /** Whether configuration was loaded successfully */
      loaded: boolean;
    };
  }

  /**
   * Health status for a system component.
   */
  export interface HealthComponentStatus {
    /** Status of the component */
    status: Status;
    /** Additional details about the component */
    details?: any;
  }

  /**
   * Basic health check response.
   */
  export interface HealthResponse {
    /** Overall system status */
    status: Status;
    /** Application version */
    version: string;
    /** Server uptime */
    uptime: string;
    /** Status of system components */
    components: Record<string, HealthComponentStatus>;
    /** Time when the server was started */
    startTime: string;
  }

  /**
   * Base interface for moving items within ordered collections.
   */
  export interface ItemMoveRequest {
    /** ID of the item to move */
    itemId: string;
    /** New position for the item (zero-based) */
    newPosition: number;
  }

  /**
   * Request payload for user login.
   */
  export interface LoginRequest {
    /** User's email address */
    email: string;
    /** User's password */
    password: string;
  }

  /**
   * Response from successful login.
   */
  export type LoginResponse = AuthenticatedResponse;

  /**
   * Request payload for searching media.
   */
  export interface MediaSearchRequest extends SearchRequest {
    /** Source platform to search */
    source?: 'youtube' | 'soundcloud' | 'all';
  }

  /**
   * Response from media search.
   */
  export interface MediaSearchResponse {
    /** List of media search results */
    results: Medias.SearchResult[];
    /** Token for fetching the next page of results */
    nextPageToken?: string;
    /** Total number of results available */
    totalResults: number;
    /** Source that was searched */
    source: string;
    /** Original search query */
    query: string;
  }

  /**
   * Request payload for voting on media.
   */
  export interface MediaVoteRequest {
    /** Type of vote */
    vote: 'woot' | 'meh' | 'grab';
  }

  /**
   * Response from media vote.
   */
  export interface MediaVoteResponse {
    /** Whether the vote was successful */
    success: boolean;
    /** Current vote counts after this vote */
    currentVotes: {
      /** Number of positive votes */
      woots: number;
      /** Number of negative votes */
      mehs: number;
      /** Number of users who added to playlist */
      grabs: number;
      /** Map of user IDs to their vote type */
      voters: Record<string, string>;
    };
    /** Optional message about the vote */
    message?: string;
  }

  /**
   * Request payload for changing password.
   */
  export interface PasswordChangeRequest {
    /** User's current password for verification */
    currentPassword: string;
    /** User's new password */
    newPassword: string;
  }

  /**
   * Request payload for adding an item to a playlist.
   */
  export interface PlaylistAddItemRequest {
    /** ID of the media to add */
    mediaId: string;
    /** Optional position to insert the media (default: end of playlist) */
    position?: number;
  }

  /**
   * Base interface for playlist modification requests.
   */
  export interface PlaylistBaseRequest {
    /** Name of the playlist */
    name?: string;
    /** Description of the playlist */
    description?: string;
    /** Whether the playlist is private */
    isPrivate?: boolean;
    /** Tags associated with the playlist */
    tags?: string[];
    /** URL to a cover image */
    coverImage?: string;
  }

  /**
   * Request payload for creating a new playlist.
   */
  export interface PlaylistCreateRequest extends Required<Omit<PlaylistBaseRequest, 'coverImage'>> {
    /** Optional URL to a cover image */
    coverImage?: string;
  }

  /**
   * Request payload for importing a playlist from an external source.
   */
  export interface PlaylistImportRequest {
    /** Source platform */
    source: 'youtube' | 'soundcloud';
    /** ID of the playlist on the source platform */
    sourceId: string;
    /** Name for the new playlist */
    name: string;
    /** Whether the imported playlist should be private */
    isPrivate: boolean;
  }

  /**
   * Request payload for moving an item within a playlist.
   */
  export type PlaylistMoveItemRequest = ItemMoveRequest;

  /**
   * Criteria for searching playlists.
   */
  export interface PlaylistSearchCriteria extends Omit<SearchRequest, 'limit'> {
    /** Filter by tags */
    tags?: string[];
    /** Whether to include private playlists */
    includePrivate?: boolean;
    /** Field to sort by */
    sortBy?: string;
    /** Sort direction (asc or desc) */
    sortDirection?: string;
    /** Page number for pagination */
    page?: number;
    /** Number of results per page */
    limit?: number;
  }

  /**
   * Request payload for setting a playlist as active.
   */
  export interface PlaylistSetActiveRequest {
    /** ID of the playlist to set as active */
    playlistId: string;
  }

  /**
   * Request payload for updating a playlist.
   */
  export type PlaylistUpdateRequest = PlaylistBaseRequest;

  /**
   * Response from token refresh.
   */
  export interface RefreshResponse {
    /** New authentication token */
    token: string;
  }

  /**
   * Request payload for user registration.
   */
  export interface RegisterRequest {
    /** User's chosen username */
    username: string;
    /** User's email address */
    email: string;
    /** User's password */
    password: string;
  }

  /**
   * Response from successful registration.
   */
  export type RegisterResponse = AuthenticatedResponse;

  /**
   * Base interface for search requests.
   */
  export interface SearchRequest {
    /** Search query text */
    query: string;
    /** Maximum number of results to return */
    limit?: number;
  }

  /** Possible health status values */
  type Status = 'up' | 'down' | 'unknown';

  /**
   * Generic success response.
   */
  export interface SuccessResponse {
    /** Whether the operation was successful */
    success: boolean;
    /** Message describing the result */
    message: string;
  }

  /**
   * Request payload for updating user profile.
   */
  export interface UserUpdateRequest {
    /** New username */
    username?: string;
    /** Updated avatar configuration */
    avatarConfig?: Users.AvatarConfig;
    /** Updated profile information */
    profile?: Users.Profile;
    /** Updated user settings */
    settings?: Users.Settings;
  }
}
