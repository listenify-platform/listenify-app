import type { Users } from "./users";

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
  