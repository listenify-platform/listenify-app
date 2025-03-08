import type { Users } from "./users";

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
  