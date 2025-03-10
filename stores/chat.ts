import { useInitializableStore, type Chat, type EventSubscription, RPC } from '@/custom';
import { useRoomStore } from './room';
import { useUserStore } from './user';

export const useChatStore = useInitializableStore(defineStore('chat', () => {
  // Get RPC service for chat communication
  const rpc = useRpc();
  const roomStore = useRoomStore();
  const userStore = useUserStore();

  // Track event subscriptions for cleanup
  const eventSubscriptions: EventSubscription[] = [];

  // State
  const state = reactive<{
    messages: Chat.MessageResponse[];
    pendingMessages: Map<string, Chat.MessageResponse>;
    error: string | null;
    loading: boolean;
  }>({
    messages: [],
    pendingMessages: new Map(),
    error: null,
    loading: false
  });

  // Server message type
  interface ServerMessage {
    id: string;
    roomId: string;
    userId: string;
    type: string;
    content: string;
    mentions: string[] | null;
    replyTo: string;
    isDeleted: boolean;
    deletedBy: string;
    isEdited: boolean;
    createdAt: string;
    userRole: string;
  }

  // Ensure messages array is always initialized
  function ensureMessagesArray() {
    if (!Array.isArray(state.messages)) {
      state.messages = [];
    }
  }

  // Initialize store and set up event listeners
  async function initialize() {
    try {
      // Ensure messages array is initialized
      state.messages = [];
      state.pendingMessages.clear();
      subscribeToEvents();
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  // Subscribe to chat-related RPC events
  function subscribeToEvents() {
    eventSubscriptions.push(
      rpc.on(RPC.Methods.ROOM_CHAT_MESSAGE, handleChatMessage),
      rpc.on(RPC.Methods.CHAT_MESSAGE, handleChatMessage)
    );
  }

  // Unsubscribe from events on cleanup
  onUnmounted(() => {
    eventSubscriptions.forEach(sub => sub.unsubscribe());
  });

  // Handle incoming chat messages
  async function handleChatMessage(data: { message: ServerMessage }) {
    if (!data?.message) return;
    
    const msg = data.message;
    ensureMessagesArray();
    
    try {
      // Find and remove any pending messages with matching content
      if (state.pendingMessages.size > 0) {
        const pendingIds = Array.from(state.pendingMessages.keys());
        for (const pendingId of pendingIds) {
          const pendingMsg = state.pendingMessages.get(pendingId);
          if (pendingMsg && 
              pendingMsg.content === msg.content && 
              pendingMsg.user.id === msg.userId) {
            state.pendingMessages.delete(pendingId);
            break;
          }
        }
      }

      // Convert and validate message before adding
      const convertedMessage = await convertServerMessageToResponse(msg);
      if (convertedMessage && !state.messages.some(m => m?.id === msg.id)) {
        state.messages.push(convertedMessage);
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
      ensureMessagesArray();
    }
  }

  // Convert server message to MessageResponse format
  async function convertServerMessageToResponse(msg: any): Promise<Chat.MessageResponse> {
    const currentUser = userStore.user;
    const isCurrentUser = currentUser && currentUser.id === msg.userId;

    // If it's the current user, use their info
    if (isCurrentUser && currentUser) {
      return {
        id: msg.id,
        roomId: msg.roomId,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatarConfig: currentUser.avatarConfig,
          profile: currentUser.profile,
          stats: currentUser.stats,
          badges: currentUser.badges,
          roles: currentUser.roles,
          online: true
        },
        type: msg.type,
        content: msg.content,
        isDeleted: msg.isDeleted,
        isEdited: msg.isEdited,
        timestamp: msg.createdAt,
        userRole: msg.userRole,
        metadata: {}
      };
    }

    // Try to find user in room users
    const currentRoom = roomStore.currentRoom;
    let roomUser = currentRoom?.users.find(u => u.id === msg.userId);

    // If not found in room users, try to get from user store
    if (!roomUser) {
      try {
        const userProfile = await userStore.getUser(msg.userId);
        if (userProfile) {
          roomUser = {
            id: userProfile.id,
            username: userProfile.username,
            avatarConfig: userProfile.avatarConfig,
            profile: userProfile.profile,
            stats: userProfile.stats,
            badges: userProfile.badges,
            roles: userProfile.roles,
            online: true
          };
        }
      } catch (error) {
        console.warn(`Could not fetch user profile for ${msg.userId}:`, error);
      }
    }

    // Use found user info or fallback to default
    return {
      id: msg.id,
      roomId: msg.roomId,
      user: roomUser || {
        id: msg.userId,
        username: msg.username || 'Unknown User',
        avatarConfig: {
          type: 'default',
          collection: 'default',
          number: 1
        },
        profile: {
          bio: '',
          location: '',
          website: '',
          social: {
            twitter: '',
            instagram: '',
            soundCloud: '',
            youTube: '',
            spotify: ''
          },
          language: 'en',
          joinDate: msg.createdAt,
          status: 'online'
        },
        stats: {
          experience: 0,
          level: 1,
          points: 0,
          playCount: 0,
          woots: 0,
          mehs: 0,
          audienceTime: 0,
          djTime: 0,
          roomsCreated: 0,
          roomsJoined: 0,
          chatMessages: 0,
          lastUpdated: msg.createdAt
        },
        badges: [],
        roles: [msg.userRole],
        online: true
      },
      type: msg.type,
      content: msg.content,
      isDeleted: msg.isDeleted,
      isEdited: msg.isEdited,
      timestamp: msg.createdAt,
      userRole: msg.userRole,
      metadata: {}
    };
  }

  // Create a pending message
  function createPendingMessage(content: string): Chat.MessageResponse {
    const currentUser = userStore.user;
    const currentRoom = roomStore.currentRoom;

    if (!currentUser || !currentRoom) {
      throw new Error('Cannot create message: user or room not found');
    }

    return {
      id: `pending-${Date.now()}`,
      roomId: currentRoom.id,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        avatarConfig: currentUser.avatarConfig,
        profile: currentUser.profile,
        stats: currentUser.stats,
        badges: currentUser.badges,
        roles: currentUser.roles,
        online: true
      },
      type: 'text',
      content,
      isDeleted: false,
      isEdited: false,
      timestamp: new Date().toISOString(),
      userRole: currentUser.roles[0] || 'user',
      metadata: {}
    };
  }

  // Send a chat message
  async function sendMessage(content: string) {
    if (!content.trim()) return;

    let pendingMessage: Chat.MessageResponse | null = null;

    try {
      const currentRoom = roomStore.currentRoom;
      if (!currentRoom) {
        throw new Error('Cannot send message: not in a room');
      }

      // Create and add pending message
      pendingMessage = createPendingMessage(content);
      state.pendingMessages.set(pendingMessage.id, pendingMessage);

      // Set timeout to clear pending message if no response
      const timeoutId = setTimeout(() => {
        if (pendingMessage && state.pendingMessages.has(pendingMessage.id)) {
          state.pendingMessages.delete(pendingMessage.id);
          state.error = 'Message sending timed out';
        }
      }, 10000); // 10 second timeout

      const response = await rpc.call(
        RPC.Methods.SEND_CHAT_MESSAGE,
        {
          roomId: currentRoom.id,
          content: content.trim()
        }
      );

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      // Handle successful response
      if (response?.message) {
        // Remove pending message
        if (pendingMessage) {
          state.pendingMessages.delete(pendingMessage.id);
        }

        // Add the confirmed message if not already in the list
        // (it might already be there from the event)
        const confirmedMessage = await convertServerMessageToResponse(response.message);
        if (confirmedMessage && !state.messages.some(m => m.id === confirmedMessage.id)) {
          state.messages.push(confirmedMessage);
        }
      }

    } catch (error: any) {
      state.error = error?.message;
      // Remove pending message on error
      if (pendingMessage) {
        state.pendingMessages.delete(pendingMessage.id);
      }
    }
  }

  // Load chat history
  async function loadChatHistory(roomId: string) {
    try {
      state.loading = true;
      ensureMessagesArray();

      const response = await rpc.call(
        RPC.Methods.GET_CHAT_MESSAGES,
        { roomId }
      ) as { messages: RPC.ChatMessage[] };
      
      if (response?.messages && Array.isArray(response.messages)) {
        const convertedMessages = await Promise.all(
          response.messages
            .filter(msg => msg != null)
            .map(msg => convertServerMessageToResponse(msg))
        );
        state.messages = convertedMessages.filter(msg => msg != null);
      } else {
        state.messages = [];
      }
    } catch (error: any) {
      state.error = error?.message;
      state.messages = [];
    } finally {
      state.loading = false;
    }
  }

  // Clear chat messages when leaving room
  function clearMessages() {
    state.messages = [];
    state.pendingMessages.clear();
  }

  return {
    // State
    messages: toRef(state, 'messages'),
    pendingMessages: toRef(state, 'pendingMessages'),
    error: toRef(state, 'error'),
    loading: toRef(state, 'loading'),

    // Actions
    initialize,
    sendMessage,
    loadChatHistory,
    clearMessages
  };
}), {
  timeout: 5000,
  throwErrors: false
});