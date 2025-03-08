import type { Medias } from "./medias";
import type { Users } from "./users";

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