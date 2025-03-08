
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
  