/**
 * @fileoverview Comprehensive type definitions for the application.
 * This file contains all interface and type definitions used throughout the application,
 * organized by logical namespace.
 */

/**
 * API namespace contains all interfaces used for API requests and responses.
 * These types are used when communicating with the backend HTTP API.
 */
export namespace API {
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
  export interface LoginResponse {
    /** Authenticated user's public profile */
    user: Users.User;
    /** Authentication token for subsequent requests */
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
  export interface RegisterResponse {
    /** Newly registered user's public profile */
    user: Users.User;
    /** Authentication token for subsequent requests */
    token: string;
  }

  /**
   * Response from token refresh.
   */
  export interface RefreshResponse {
    /** New authentication token */
    token: string;
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
   * Request payload for creating a new playlist.
   */
  export interface PlaylistCreateRequest {
    /** Name of the playlist */
    name: string;
    /** Description of the playlist */
    description: string;
    /** Whether the playlist is private */
    isPrivate: boolean;
    /** Tags associated with the playlist */
    tags: string[];
    /** Optional URL to a cover image */
    coverImage?: string;
  }

  /**
   * Request payload for updating a playlist.
   */
  export interface PlaylistUpdateRequest {
    /** New name of the playlist */
    name?: string;
    /** Updated description */
    description?: string;
    /** Updated privacy setting */
    isPrivate?: boolean;
    /** Updated tags */
    tags?: string[];
    /** Updated cover image URL */
    coverImage?: string;
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
   * Request payload for moving an item within a playlist.
   */
  export interface PlaylistMoveItemRequest {
    /** ID of the playlist item to move */
    itemId: string;
    /** New position for the item (zero-based) */
    newPosition: number;
  }

  /**
   * Request payload for setting a playlist as active.
   */
  export interface PlaylistSetActiveRequest {
    /** ID of the playlist to set as active */
    playlistId: string;
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
   * Criteria for searching playlists.
   */
  export interface PlaylistSearchCriteria {
    /** Search query text */
    query?: string;
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
   * Request payload for searching media.
   */
  export interface MediaSearchRequest {
    /** Search query text */
    query: string;
    /** Source platform to search */
    source?: 'youtube' | 'soundcloud' | 'all';
    /** Maximum number of results to return */
    limit?: number;
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

  /** Possible health status values */
  type Status = 'up' | 'down' | 'unknown';

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
   * Generic success response.
   */
  export interface SuccessResponse {
    /** Whether the operation was successful */
    success: boolean;
    /** Message describing the result */
    message: string;
  }
}

/**
 * RPC namespace contains interfaces used for real-time communication via WebSockets.
 * These types represent the structure of JSON-RPC messages and events.
 */
export namespace RPC {
  /**
   * Room information for real-time communications.
   */
  export interface Room {
    /** Unique identifier for the room */
    id: string;
    /** Display name of the room */
    name: string;
    /** Description of the room */
    description: string;
    /** URL-friendly identifier */
    slug: string;
    /** ID of the user who created the room */
    createdBy: string;
    /** Room configuration settings */
    settings: RoomSettings;
    /** Whether the room is currently active */
    isActive: boolean;
    /** List of user IDs with moderation privileges */
    moderators: string[];
    /** List of user IDs banned from the room */
    bannedUsers: string[];
  }

  /**
   * Room configuration settings.
   */
  export interface RoomSettings {
    /** Whether the room is private */
    isPrivate: boolean;
    /** Maximum number of users allowed */
    maxUsers: number;
    /** Whether guests (unauthenticated users) can join */
    allowGuests: boolean;
    /** Visual theme for the room */
    theme: string;
    /** Allowed media sources */
    allowedSources: string[];
  }

  /**
   * Real-time state of a room.
   */
  export interface RoomState {
    /** Unique identifier for the room */
    id: string;
    /** Display name of the room */
    name: string;
    /** List of users currently in the room */
    users: RoomUser[];
    /** List of user IDs in the DJ queue */
    queue: string[];
    /** ID of the current DJ, or null if none */
    currentDJ: string | null;
    /** Currently playing track, or null if none */
    currentTrack: Track | null;
    /** Whether media is currently playing */
    isPlaying: boolean;
  }

  /**
   * User information within a room context.
   */
  export interface RoomUser {
    /** Unique identifier for the user */
    id: string;
    /** Display name of the user */
    username: string;
    /** URL to the user's avatar image */
    avatarUrl: string;
    /** User's role in the room (e.g., "user", "dj", "mod", "admin") */
    role: string;
  }

  /**
   * Media track information.
   */
  export interface Track {
    /** Unique identifier for the track */
    id: string;
    /** Title of the track */
    title: string;
    /** Artist of the track */
    artist: string;
    /** Duration of the track in seconds */
    duration: number;
    /** URL to the track's thumbnail image */
    thumbnail: string;
    /** Source platform (e.g., "youtube", "soundcloud") */
    source: string;
    /** ID of the track on the source platform */
    sourceId: string;
  }

  /**
   * Chat message for real-time communication.
   */
  export interface ChatMessage {
    /** Unique identifier for the message */
    id: string;
    /** ID of the room the message was sent in */
    roomId: string;
    /** ID of the user who sent the message */
    senderId: string;
    /** Username of the sender */
    senderUsername: string;
    /** URL to the sender's avatar */
    senderAvatarUrl: string;
    /** Content of the message */
    content: string;
    /** Type of message (e.g., "text", "emote", "system") */
    type: string;
    /** When the message was sent */
    timestamp: Date;
    /** Whether the message has been deleted */
    deleted?: boolean;
    /** Additional information about the message */
    metadata?: Record<string, any>;
  }

  /**
   * History entry for a played track.
   */
  export interface PlayHistoryItem {
    /** ID of the track that was played */
    trackId: string;
    /** Information about the track */
    track: Track;
    /** ID of the user who played the track */
    djId: string;
    /** Information about the DJ */
    dj: RoomUser;
    /** When the track was played */
    playedAt: Date;
    /** Voting information */
    votes: {
      /** Number of positive votes */
      positive: number;
      /** Number of negative votes */
      negative: number;
    };
  }

  /**
   * Result from a media search operation.
   */
  export interface MediaSearchResult {
    /** Unique identifier for the result */
    id: string;
    /** Title of the media */
    title: string;
    /** Artist of the media */
    artist: string;
    /** Duration in seconds */
    duration: number;
    /** URL to the thumbnail image */
    thumbnail: string;
    /** Source platform */
    source: string;
    /** ID on the source platform */
    sourceId: string;
  }

  /**
   * Media information.
   */
  export interface Media {
    /** Unique identifier for the media */
    id: string;
    /** Title of the media */
    title: string;
    /** Artist of the media */
    artist: string;
    /** Duration in seconds */
    duration: number;
    /** URL to the thumbnail image */
    thumbnail: string;
    /** Source platform */
    source: string;
    /** ID on the source platform */
    sourceId: string;
    /** ID of the user who added the media */
    addedBy: string;
    /** When the media was added */
    addedAt: Date;
  }

  /**
   * Playlist information.
   */
  export interface Playlist {
    /** Unique identifier for the playlist */
    id: string;
    /** Name of the playlist */
    name: string;
    /** Description of the playlist */
    description: string;
    /** ID of the playlist owner */
    owner: string;
    /** Whether the playlist is private */
    isPrivate: boolean;
    /** Tags associated with the playlist */
    tags: string[];
    /** URL to the cover image */
    coverImage?: string;
    /** Number of items in the playlist */
    itemCount: number;
    /** When the playlist was created */
    createdAt: Date;
    /** When the playlist was last updated */
    updatedAt: Date;
  }

  /**
   * Playlist with its media items.
   */
  export interface PlaylistWithItems extends Playlist {
    /** Media items in the playlist */
    items: Media[];
  }

  /**
   * Complete user information.
   */
  export interface User {
    /** Unique identifier for the user */
    id: string;
    /** Username for display */
    username: string;
    /** Email address of the user */
    email: string;
    /** URL to the user's avatar */
    avatarUrl: string;
    /** User's role (e.g., "user", "mod", "admin") */
    role: string;
    /** Additional profile information */
    profile?: {
      /** User's biography */
      bio?: string;
      /** User's location */
      location?: string;
      /** User's website URL */
      website?: string;
      /** User's current status */
      status?: string;
    };
    /** When the user account was created */
    createdAt: Date;
  }

  /**
   * Public user information visible to other users.
   */
  export interface PublicUser {
    /** Unique identifier for the user */
    id: string;
    /** Username for display */
    username: string;
    /** URL to the user's avatar */
    avatarUrl: string;
    /** User's role */
    role: string;
    /** Additional public profile information */
    profile?: {
      /** User's biography */
      bio?: string;
      /** User's location */
      location?: string;
      /** User's website URL */
      website?: string;
      /** User's current status */
      status?: string;
    };
  }

  /**
   * User statistics.
   */
  export interface UserStats {
    /** User's experience level */
    level: number;
    /** Experience points */
    experience: number;
    /** Number of rooms created by the user */
    roomsCreated: number;
    /** Number of rooms the user has joined */
    roomsJoined: number;
    /** Number of tracks the user has played as DJ */
    tracksPlayed: number;
    /** Total votes received for tracks played */
    votesReceived: number;
    /** Hours spent listening to music */
    hoursListened: number;
    /** When the user was last active */
    lastActive: Date;
  }
}

/**
 * Chat namespace contains interfaces related to the real-time chat system.
 */
export namespace Chat {
  /**
   * Chat message structure.
   */
  export interface Message {
    /** Unique identifier for the message */
    id: string;
    /** ID of the room the message was sent in */
    roomId: string;
    /** ID of the user who sent the message */
    userId: string;
    /** Type of message */
    type: 'text' | 'emote' | 'system' | 'command';
    /** Content of the message */
    content: string;
    /** IDs of users mentioned in the message */
    mentions: string[];
    /** ID of the message being replied to, if any */
    replyTo?: string;
    /** Whether the message has been deleted */
    isDeleted: boolean;
    /** ID of the user who deleted the message, if applicable */
    deletedBy?: string;
    /** When the message was deleted, if applicable */
    deletedAt?: string;
    /** Whether the message has been edited */
    isEdited: boolean;
    /** When the message was last edited, if applicable */
    editedAt?: string;
    /** When the message was created */
    createdAt: string;
    /** Role of the user who sent the message */
    userRole: string;
    /** Additional information about the message */
    metadata?: Record<string, any>;
  }

  /**
   * Chat message with related user information.
   */
  export interface MessageResponse {
    /** Unique identifier for the message */
    id: string;
    /** ID of the room the message was sent in */
    roomId: string;
    /** Information about the user who sent the message */
    user: Users.Public;
    /** Type of message */
    type: string;
    /** Content of the message */
    content: string;
    /** Users mentioned in the message */
    mentions?: Users.Public[];
    /** Message being replied to, if any */
    replyTo?: MessageResponse;
    /** Whether the message has been deleted */
    isDeleted: boolean;
    /** Whether the message has been edited */
    isEdited: boolean;
    /** When the message was sent */
    timestamp: string;
    /** Role of the user who sent the message */
    userRole: string;
    /** Additional information about the message */
    metadata?: Record<string, any>;
  }

  /**
   * Emote that can be used in chat.
   */
  export interface Emote {
    /** Unique identifier for the emote */
    id: string;
    /** Text code for the emote */
    code: string;
    /** URL to the emote image */
    imageUrl: string;
    /** ID of the user who created the emote */
    creator: string;
    /** Whether the emote is available globally */
    isGlobal: boolean;
    /** ID of the room the emote belongs to, if not global */
    roomId?: string;
    /** When the emote was created */
    createdAt: string;
    /** When the emote was last updated */
    updatedAt: string;
  }

  /**
   * Command that can be executed in chat.
   */
  export interface Command {
    /** Name of the command */
    name: string;
    /** Description of what the command does */
    description: string;
    /** Example of how to use the command */
    usage: string;
    /** Minimum role required to use the command */
    minimumRole: string;
    /** Whether the command is currently enabled */
    enabled: boolean;
    /** Cooldown between uses in seconds */
    cooldownSeconds: number;
  }

  /**
   * Moderation action in chat.
   */
  export interface Moderation {
    /** Unique identifier for the moderation action */
    id: string;
    /** ID of the room where the action was taken */
    roomId: string;
    /** ID of the moderator who took the action */
    moderatorId: string;
    /** ID of the user who was moderated */
    targetUserId: string;
    /** ID of the message that was moderated, if applicable */
    messageId?: string;
    /** Type of moderation action */
    action: 'warn' | 'mute' | 'unmute' | 'kick' | 'ban' | 'unban' | 'delete';
    /** Reason for the moderation action */
    reason: string;
    /** Duration of the action in minutes (for mutes and bans) */
    duration?: number;
    /** When the action expires (for mutes and bans) */
    expiresAt?: string;
    /** When the action was taken */
    createdAt: string;
  }

  /**
   * State of the chat system.
   */
  export interface State {
    /** Current chat messages */
    messages: MessageResponse[];
    /** Available emotes */
    emotes: Emote[];
    /** Available commands */
    commands: Command[];
    /** Currently muted users */
    mutedUsers: Record<string, {
      /** When the mute expires */
      expiresAt: string,
      /** Reason for the mute */
      reason: string
    }>;
    /** Whether the current user is muted */
    userIsMuted: boolean;
    /** When the current user's mute expires, if applicable */
    userMuteExpiry?: string;
    /** Whether chat is currently loading */
    isLoading: boolean;
    /** Error message, if any */
    error: string | null;
    /** ID of the current room */
    currentRoomId?: string;
    /** Cache of messages by room ID */
    messageCache: Record<string, MessageResponse[]>;
  }
}

/**
 * Users namespace contains interfaces related to user profiles and account management.
 */
export namespace Users {
  /**
   * Avatar configuration for user profiles.
   */
  export interface AvatarConfig {
    /** Type of avatar (e.g., "default", "custom") */
    type: string;
    /** Selected collection name */
    collection: string;
    /** Selected number from a collection, starting from 1 */
    number: number;
    /** URL to a custom image, if applicable */
    customImage?: string;
  }

  /**
   * Social media links for user profiles.
   */
  export interface Social {
    /** Twitter handle */
    twitter: string;
    /** Instagram handle */
    instagram: string;
    /** SoundCloud handle */
    soundCloud: string;
    /** YouTube channel */
    youTube: string;
    /** Spotify profile */
    spotify: string;
  }

  /**
   * User profile information.
   */
  export interface Profile {
    /** User's biography */
    bio: string;
    /** User's location */
    location: string;
    /** User's website URL */
    website: string;
    /** User's social media links */
    social: Social;
    /** User's preferred language */
    language: string;
    /** When the user joined */
    joinDate: string;
    /** User's current status */
    status: string;
  }

  /**
   * User statistics.
   */
  export interface Stats {
    /** Experience points */
    experience: number;
    /** User's level */
    level: number;
    /** Points accumulated */
    points: number;
    /** Number of tracks played as DJ */
    playCount: number;
    /** Number of positive votes received */
    woots: number;
    /** Number of negative votes received */
    mehs: number;
    /** Time spent as audience (in seconds) */
    audienceTime: number;
    /** Time spent as DJ (in seconds) */
    djTime: number;
    /** Number of rooms created */
    roomsCreated: number;
    /** Number of rooms joined */
    roomsJoined: number;
    /** Number of chat messages sent */
    chatMessages: number;
    /** When the stats were last updated */
    lastUpdated: string;
  }

  /**
   * User's social connections.
   */
  export interface Connections {
    /** IDs of users this user is following */
    following: string[];
    /** IDs of users following this user */
    followers: string[];
    /** IDs of mutual followers (friends) */
    friends: string[];
    /** IDs of users this user has blocked */
    blocked: string[];
    /** IDs of rooms this user has favorited */
    favorites: string[];
  }

  /**
   * User preferences and settings.
   */
  export interface Settings {
    /** Visual theme preference */
    theme: string;
    /** Whether to automatically join DJ queue */
    autoJoinDJ: boolean;
    /** Whether to automatically upvote played tracks */
    autoWoot: boolean;
    /** Whether to show images in chat */
    showChatImages: boolean;
    /** Whether to enable notifications */
    enableNotifications: boolean;
    /** Types of notifications to receive */
    notificationTypes: Record<string, boolean>;
    /** Whether to notify on chat mentions */
    chatMentions: boolean;
    /** Volume level (0-100) */
    volume: number;
    /** Whether to hide the audience */
    hideAudience: boolean;
    /** Video player size preference */
    videoSize: string;
    /** Whether to filter inappropriate language */
    languageFilter: boolean;
  }

  /**
   * Complete user information.
   */
  export interface User {
    /** Unique identifier for the user */
    id: string;
    /** Display name */
    username: string;
    /** Email address */
    email: string;
    /** Avatar configuration */
    avatarConfig: AvatarConfig;
    /** Profile information */
    profile: Profile;
    /** User statistics */
    stats: Stats;
    /** Earned badges */
    badges: string[];
    /** Social connections */
    connections: Connections;
    /** User preferences */
    settings: Settings;
    /** User roles */
    roles: string[];
    /** Whether the account is active */
    isActive: boolean;
    /** Whether the email has been verified */
    isVerified: boolean;
    /** When the user last logged in */
    lastLogin: string;
    /** When the account was created */
    createdAt: string;
    /** When the account was last updated */
    updatedAt: string;
  }

  /**
   * Public user information visible to other users.
   */
  export interface Public {
    /** Unique identifier for the user */
    id: string;
    /** Display name */
    username: string;
    /** Avatar configuration */
    avatarConfig: AvatarConfig;
    /** Profile information */
    profile: Profile;
    /** User statistics */
    stats: Stats;
    /** Earned badges */
    badges: string[];
    /** User roles */
    roles: string[];
    /** Whether the user is currently online */
    online: boolean;
  }

  /**
   * Authentication state.
   */
  export interface AuthState {
    /** Authentication token */
    token: string | null;
    /** Whether a user is authenticated */
    isAuthenticated: boolean;
    /** Whether authentication is in progress */
    loading: boolean;
  }

  /**
   * User personal state.
   */
  export interface PersonalState extends AuthState {
    /** Public profile information */
    user: User | null;

  }
}

/**
 * Rooms namespace contains interfaces related to music rooms and DJ functionality.
 */
export namespace Rooms {
  /**
   * Room configuration settings.
   */
  export interface Settings {
    /** Whether the room is private */
    private: boolean;
    /** Maximum number of users allowed */
    capacity: number;
    /** Maximum size of the DJ waitlist */
    waitlistMax: number;
    /** Visual theme for the room */
    theme: string;
    /** Welcome message for new users */
    welcome: string;
    /** Allowed media sources */
    allowedSources: string[];
    /** Maximum allowed song length in seconds */
    maxSongLength: number;
    /** Whether chat is enabled */
    chatEnabled: boolean;
    /** Minimum delay between chat messages in seconds */
    chatDelay: number;
    /** Whether to automatically skip disconnected DJs */
    autoSkipDisconnect: boolean;
    /** Time after which to skip disconnected DJs in seconds */
    autoSkipAfterTime: number;
    /** Whether guests can join the DJ queue */
    guestCanJoinQueue: boolean;
    /** Whether the room requires a password */
    passwordProtected: boolean;
  }

  /**
   * Room statistics.
   */
  export interface Stats {
    /** Total number of tracks played */
    totalPlays: number;
    /** Total number of unique users who have joined */
    totalUsers: number;
    /** Highest number of concurrent users */
    peakUsers: number;
    /** Total number of chat messages */
    totalChatMessages: number;
    /** Total time the room has existed (in seconds) */
    createdDuration: number;
    /** Total time the room has been active (in seconds) */
    activeDuration: number;
    /** Total number of positive votes */
    totalWoots: number;
    /** Total number of negative votes */
    totalMehs: number;
    /** Overall rating of the room */
    aggregateRating: number;
    /** When the stats were last reset */
    lastStatsReset: string;
  }

  /**
   * Entry in the DJ queue.
   */
  export interface QueueEntry {
    /** Information about the user in the queue */
    user: Users.Public;
    /** Position in the queue (0-based) */
    position: number;
    /** When the user joined the queue */
    joinTime: string;
    /** Number of tracks the user has played since joining */
    playCount: number;
    /** When the user joined the room */
    joinedAt: string;
  }

  /**
   * Media information.
   */
  export interface MediaInfo {
    /** Unique identifier for the media */
    id: string;
    /** Media type */
    type: string;
    /** ID on the source platform */
    sourceId: string;
    /** Title of the media */
    title: string;
    /** Artist of the media */
    artist: string;
    /** URL to the thumbnail image */
    thumbnail: string;
    /** Duration in seconds */
    duration: number;
    /** Number of times the media has been played */
    playCount: number;
    /** User who added the media */
    addedBy?: Users.Public;
  }

  /**
   * History entry for a played track.
   */
  export interface PlayHistoryEntry {
    /** Information about the played media */
    media: MediaInfo;
    /** Information about the DJ who played it */
    dj: Users.Public;
    /** When the track was played */
    playTime: string;
    /** Number of positive votes received */
    woots: number;
    /** Number of negative votes received */
    mehs: number;
    /** Number of users who added to playlist */
    grabs: number;
  }

  /**
   * Real-time state of a room.
   */
  export interface State {
    /** Unique identifier for the room */
    id: string;
    /** Display name of the room */
    name: string;
    /** Room configuration */
    settings: Settings;
    /** Currently active DJ */
    currentDJ?: Users.Public;
    /** Currently playing media */
    currentMedia?: MediaInfo;
    /** List of users in the DJ queue */
    djQueue: QueueEntry[];
    /** Number of users currently in the room */
    activeUsers: number;
    /** List of users currently in the room */
    users: Users.Public[];
    /** When the current media started playing */
    mediaStartTime: string;
    /** Current position in the media in seconds */
    mediaProgress: number;
    /** Expected time when the current media will end */
    mediaEndTime: string;
    /** Recently played media */
    playHistory: PlayHistoryEntry[];
  }

  /**
   * Room information.
   */
  export interface Room {
    /** Unique identifier for the room */
    id: string;
    /** Display name of the room */
    name: string;
    /** URL-friendly identifier */
    slug: string;
    /** Description of the room */
    description: string;
    /** ID of the user who created the room */
    createdBy: string;
    /** Room configuration settings */
    settings: Settings;
    /** Room statistics */
    stats: Stats;
    /** List of user IDs with moderation privileges */
    moderators: string[];
    /** List of user IDs banned from the room */
    bannedUsers: string[];
    /** Tags associated with the room */
    tags: string[];
    /** ID of the current DJ, if any */
    currentDJ?: string;
    /** ID of the currently playing media, if any */
    currentMedia?: string;
    /** Whether the room is currently active */
    isActive: boolean;
    /** When the room was created */
    createdAt: string;
    /** When the room was last updated */
    updatedAt: string;
    /** When the last activity occurred in the room */
    lastActivity: string;
  }

  /**
   * State for the rooms module.
   */
  export interface RoomsState {
    /** Currently active room */
    currentRoom: State | null;
    /** List of available rooms */
    roomList: Room[];
    /** List of popular rooms */
    popularRooms: Room[];
    /** List of rooms the user has favorited */
    favoriteRooms: Room[];
    /** Results from room search */
    searchResults: Room[];
    /** Whether rooms are being loaded */
    loading: boolean;
    /** Error message, if any */
    error: string | null;
    /** Whether the current user is in the DJ queue */
    isInQueue: boolean;
    /** Whether the current user is the active DJ */
    isCurrentDJ: boolean;
    /** Current user's position in the DJ queue (-1 if not in queue) */
    queuePosition: number;
    /** Current user's vote for the playing media */
    userVote: 'woot' | 'meh' | 'grab' | null;
  }
}

/**
 * Medias namespace contains interfaces related to media items and playback.
 */
export namespace Medias {
  /**
   * Additional metadata for media items.
   */
  export interface Metadata {
    /** View count on the original platform */
    views: number;
    /** Like count on the original platform */
    likes: number;
    /** When the media was published on the original platform */
    publishedAt: string;
    /** ID of the channel/user that published the media */
    channelId: string;
    /** Name of the channel/user that published the media */
    channelTitle: string;
    /** Description of the media */
    description: string;
    /** Tags associated with the media */
    tags: string[];
    /** Categories the media belongs to */
    categories: string[];
    /** Content rating (e.g., "PG", "TV-MA") */
    contentRating: string;
    /** Whether the media has content restrictions */
    restricted: boolean;
  }

  /**
   * Statistics for a media item.
   */
  export interface Stats {
    /** Number of times the media has been played */
    playCount: number;
    /** Number of positive votes received */
    wootCount: number;
    /** Number of negative votes received */
    mehCount: number;
    /** Number of users who added to playlist */
    grabCount: number;
    /** Number of times the media was skipped */
    skipCount: number;
    /** When the media was last played */
    lastPlayed: string;
    /** Overall rating of the media */
    aggregateRating: number;
    /** When the stats were last updated */
    lastUpdated: string;
  }

  /**
   * Complete media information.
   */
  export interface Media {
    /** Unique identifier for the media */
    id: string;
    /** Media type (e.g., "youtube", "soundcloud") */
    type: string;
    /** ID on the source platform */
    sourceId: string;
    /** Title of the media */
    title: string;
    /** Artist of the media */
    artist: string;
    /** URL to the thumbnail image */
    thumbnail: string;
    /** Duration in seconds */
    duration: number;
    /** Additional metadata */
    metadata: Metadata;
    /** Media statistics */
    stats: Stats;
    /** ID of the user who added the media */
    addedBy: string;
    /** When the media was added */
    createdAt: string;
    /** When the media was last updated */
    updatedAt: string;
  }

  /**
   * Simplified media information.
   */
  export interface Info {
    /** Unique identifier for the media */
    id: string;
    /** Media type */
    type: string;
    /** ID on the source platform */
    sourceId: string;
    /** Title of the media */
    title: string;
    /** Artist of the media */
    artist: string;
    /** URL to the thumbnail image */
    thumbnail: string;
    /** Duration in seconds */
    duration: number;
    /** Number of times the media has been played */
    playCount: number;
    /** User who added the media */
    addedBy?: Users.Public;
  }

  /**
   * Result from a media search.
   */
  export interface SearchResult {
    /** Media type */
    type: string;
    /** ID on the source platform */
    sourceId: string;
    /** Title of the media */
    title: string;
    /** Artist of the media */
    artist: string;
    /** URL to the thumbnail image */
    thumbnail: string;
    /** Duration in seconds */
    duration: number;
    /** View count on the original platform */
    views: number;
    /** When the media was published */
    publishedAt: string;
    /** Description of the media */
    description: string;
    /** Name of the channel that published the media */
    channelTitle: string;
    /** Whether the media has content restrictions */
    restricted: boolean;
  }

  /**
   * Vote information for media.
   */
  export interface Votes {
    /** Number of positive votes */
    woots: number;
    /** Number of negative votes */
    mehs: number;
    /** Number of users who added to playlist */
    grabs: number;
    /** Map of user IDs to their vote type */
    voters: Record<string, string>;
  }

  /**
   * State for the media module.
   */
  export interface State {
    /** Recently added media */
    recentMedia: Info[];
    /** Results from media search */
    searchResults: SearchResult[];
    /** Currently selected media */
    currentMedia: Media | null;
    /** Current user's vote for the media */
    currentUserVote: string | null;
    /** Recently played media */
    recentlyPlayedMedia: Info[];
    /** Popular media */
    popularMedia: Info[];
    /** Whether media is being loaded */
    loading: boolean;
    /** Error message, if any */
    error: string | null;
  }
}

/**
 * Playlists namespace contains interfaces related to playlists and media collections.
 */
export namespace Playlists {
  /**
   * Item in a playlist.
   */
  export interface Item {
    /** Unique identifier for the playlist item */
    id: string;
    /** ID of the media */
    mediaId: string;
    /** Position in the playlist (0-based) */
    order: number;
    /** When the item was added to the playlist */
    addedAt: string;
    /** When the item was last played from this playlist */
    lastPlayed: string;
    /** Number of times the item has been played from this playlist */
    playCount: number;
    /** Media information (populated when retrieving the playlist) */
    media?: Medias.Info;
  }

  /**
   * Statistics for a playlist.
   */
  export interface Stats {
    /** Total number of items in the playlist */
    totalItems: number;
    /** Total duration of all items in seconds */
    totalDuration: number;
    /** Number of times the playlist has been played */
    totalPlays: number;
    /** Number of users following the playlist */
    followers: number;
    /** When the stats were last calculated */
    lastCalculated: string;
  }

  /**
   * Complete playlist information.
   */
  export interface Playlist {
    /** Unique identifier for the playlist */
    id: string;
    /** Name of the playlist */
    name: string;
    /** Description of the playlist */
    description: string;
    /** ID of the playlist owner */
    owner: string;
    /** Whether this is the user's currently active playlist */
    isActive: boolean;
    /** Whether the playlist is private */
    isPrivate: boolean;
    /** Items in the playlist */
    items: Item[];
    /** Playlist statistics */
    stats: Stats;
    /** Tags associated with the playlist */
    tags: string[];
    /** URL to the cover image */
    coverImage?: string;
    /** When the playlist was created */
    createdAt: string;
    /** When the playlist was last updated */
    updatedAt: string;
    /** When the playlist was last played from */
    lastPlayed: string;
  }

  /**
   * Simplified playlist information.
   */
  export interface Info {
    /** Unique identifier for the playlist */
    id: string;
    /** Name of the playlist */
    name: string;
    /** Description of the playlist */
    description: string;
    /** Owner of the playlist */
    owner?: Users.User;
    /** Whether the playlist is private */
    isPrivate: boolean;
    /** Number of items in the playlist */
    itemCount: number;
    /** Total duration of all items in seconds */
    totalDuration: number;
    /** Tags associated with the playlist */
    tags: string[];
    /** URL to the cover image */
    coverImage?: string;
    /** When the playlist was created */
    createdAt: string;
    /** When the playlist was last updated */
    updatedAt: string;
  }

  /**
   * Request to create a new playlist.
   */
  export interface CreateRequest {
    /** Name of the playlist */
    name: string;
    /** Description of the playlist */
    description: string;
    /** Whether the playlist should be private */
    isPrivate: boolean;
    /** Tags to associate with the playlist */
    tags: string[];
    /** URL to the cover image */
    coverImage?: string;
  }

  /**
   * Request to update a playlist.
   */
  export interface UpdateRequest {
    /** New name of the playlist */
    name?: string;
    /** New description of the playlist */
    description?: string;
    /** New privacy setting */
    isPrivate?: boolean;
    /** New tags for the playlist */
    tags?: string[];
    /** New cover image URL */
    coverImage?: string;
  }

  /**
   * Request to add an item to a playlist.
   */
  export interface AddItemRequest {
    /** ID of the media to add */
    mediaId: string;
    /** Position to insert the item (default: end of playlist) */
    position?: number;
  }

  /**
   * Request to move an item within a playlist.
   */
  export interface MoveItemRequest {
    /** ID of the playlist item to move */
    itemId: string;
    /** New position for the item (0-based) */
    newPosition: number;
  }

  /**
   * Request to import a playlist from an external source.
   */
  export interface ImportRequest {
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
   * State for the playlists module.
   */
  export interface State {
    /** User's playlists */
    playlists: Playlist[];
    /** Currently selected playlist */
    currentPlaylist: Playlist | null;
    /** Simplified playlist information */
    playlistInfos: Info[];
    /** ID of the user's active playlist */
    activePlaylistId: string | null;
    /** Whether playlists are being loaded */
    loading: boolean;
    /** Error message, if any */
    error: string | null;
  }
}