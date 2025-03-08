import type { Users } from "./users";

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
  