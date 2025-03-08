
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