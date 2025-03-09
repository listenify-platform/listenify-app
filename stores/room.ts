import { useInitializableStore, type EventSubscription, type Rooms, type Users, type Medias, RPC } from '@/custom';

export const useRoomStore = useInitializableStore(defineStore('room', () => {
  // Get both the API and RPC services
  const { api, execute } = useApi();
  const rpc = useRpc();

  // Track event subscriptions for cleanup
  const eventSubscriptions: EventSubscription[] = [];

  // Use composition API style for Pinia store
  const state = reactive<Rooms.RoomsState>({
    error: null,
    loading: false,
    userVote: null,
    roomList: [],
    isInQueue: false,
    currentRoom: null,
    isCurrentDJ: false,
    popularRooms: [],
    favoriteRooms: [],
    searchResults: [],
    queuePosition: -1
  });

  // Getters
  const getDJQueue = computed(() => state.currentRoom?.djQueue || []);
  const getRoomList = computed(() => state.roomList);
  const getCurrentDJ = computed(() => state.currentRoom?.currentDJ);
  const getRoomUsers = computed(() => state.currentRoom?.users || []);
  const getPlayHistory = computed(() => state.currentRoom?.playHistory || []);
  const getCurrentRoom = computed(() => state.currentRoom);
  const getPopularRooms = computed(() => state.popularRooms);
  const getCurrentMedia = computed(() => state.currentRoom?.currentMedia);
  const getUserPosition = computed(() => state.queuePosition);
  const getFavoriteRooms = computed(() => state.favoriteRooms);

  const getMediaProgress = computed(() => {
    if (!state.currentRoom) return 0;

    if (state.currentRoom.mediaProgress !== undefined)
      return state.currentRoom.mediaProgress;

    // Calculate progress based on start time
    if (state.currentRoom.mediaStartTime && state.currentRoom.currentMedia) {
      const now = Date.now();
      const startTime = new Date(state.currentRoom.mediaStartTime).getTime();
      const elapsed = Math.floor((now - startTime) / 1000);

      return Math.min(elapsed, state.currentRoom.currentMedia.duration);
    }

    return 0;
  });

  const getMediaRemaining = computed(() => {
    if (!state.currentRoom?.currentMedia) return 0;
    return Math.max(0, state.currentRoom.currentMedia.duration - getMediaProgress.value);
  });

  const getMediaProgressPercent = computed(() => {
    if (!state.currentRoom?.currentMedia) return 0;
    return (getMediaProgress.value / state.currentRoom.currentMedia.duration) * 100;
  });

  // Initialize the store and set up event listeners
  async function initialize() {
    try {
      // Subscribe to RPC events
      subscribeToRoomEvents();
    } catch (error: any) {
      state.error = error?.message;
      state.loading = false;
    }
  }

  // Unsubscribe from all events when the component is unmounted
  onUnmounted(() => {
    unsubscribeFromAllEvents();
  });

  // Subscribe to all room-related RPC events
  function subscribeToRoomEvents() {
    // Track event changes within a room
    eventSubscriptions.push(rpc.on(RPC.Methods.ROOM_TRACK_START, handleTrackStart));
    eventSubscriptions.push(rpc.on(RPC.Methods.ROOM_TRACK_END, handleTrackEnd));
    eventSubscriptions.push(rpc.on(RPC.Methods.ROOM_TRACK_SKIP, handleTrackSkip));

    // Track user joins/leaves
    eventSubscriptions.push(rpc.on(RPC.Methods.USER_JOINED_ROOM, handleUserJoin));
    eventSubscriptions.push(rpc.on(RPC.Methods.USER_LEFT_ROOM, handleUserLeave));

    // Track queue changes
    eventSubscriptions.push(rpc.on(RPC.Methods.ROOM_QUEUE_UPDATE, handleQueueUpdate));

    // Track chat messages
    eventSubscriptions.push(rpc.on(RPC.Methods.ROOM_CHAT_MESSAGE, handleChatMessage));
  }

  // Unsubscribe from all events
  function unsubscribeFromAllEvents() {
    eventSubscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // RPC event handlers
  function handleTrackStart(data: {
    roomId: string,
    dj: Users.Public,
    media: Medias.Info,
    startTime: string,
    endTime: string
  }) {
    if (state.currentRoom && data.roomId === state.currentRoom.id) {
      handleNewMedia({
        dj: data.dj,
        media: data.media,
        startTime: data.startTime,
        endTime: data.endTime
      });
    }
  }

  function handleTrackEnd(data: { roomId: string }) {
    if (state.currentRoom && data.roomId === state.currentRoom.id) {
      // Clear current media when track ends
      if (state.currentRoom) {
        state.currentRoom.currentMedia = undefined;
        state.currentRoom.mediaProgress = 0;
      }
    }
  }

  function handleTrackSkip(data: { roomId: string, userId: string, reason: string }) {
    if (state.currentRoom && data.roomId === state.currentRoom.id) {
      // Handle track skip logic
      // This will usually be followed by a track_start event
      state.userVote = null;
    }
  }

  function handleUserJoin(data: { roomId: string, user: Users.Public }) {
    if (state.currentRoom && data.roomId === state.currentRoom.id) {
      handleUserJoinRoom(data.user);
    }
  }

  function handleUserLeave(data: { roomId: string, userId: string }) {
    if (state.currentRoom && data.roomId === state.currentRoom.id) {
      handleUserLeaveRoom(data.userId);
    }
  }

  function handleQueueUpdate(data: {
    roomId: string,
    queue: Rooms.QueueEntry[]
  }) {
    if (state.currentRoom && data.roomId === state.currentRoom.id) {
      if (state.currentRoom) {
        state.currentRoom.djQueue = data.queue;
        updateUserQueueStatus();
      }
    }
  }

  function handleChatMessage(data: { roomId: string, message: RPC.ChatMessage }) {
    // This could be handled by a separate chat store
    // or you can emit an event to notify components
    console.log('Chat message received:', data.message);
  }

  // Room actions
  async function joinRoom(roomId: string) {
    try {
      state.loading = true;

      // Use RPC for joining a room (interactive action)
      const roomState = await rpc.call<Rooms.State>(
        RPC.Methods.JOIN_ROOM,
        { roomId }
      );

      state.currentRoom = roomState;
      updateUserQueueStatus();
      state.loading = false;
      return roomState;
    } catch (error: any) {
      state.error = error?.message;
      state.loading = false;
      return null;
    }
  }

  async function leaveRoom() {
    if (!state.currentRoom) return;

    try {
      // Use RPC for leaving a room (interactive action)
      await rpc.call(
        RPC.Methods.LEAVE_ROOM,
        { roomId: state.currentRoom.id }
      );

      state.currentRoom = null;
      state.isInQueue = false;
      state.isCurrentDJ = false;
      state.queuePosition = -1;
      state.userVote = null;
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  async function createRoom(roomData: {
    name: string;
    description: string;
    settings: Partial<Rooms.Settings>;
  }) {
    try {
      state.loading = true;

      // Use API for room creation
      const room = await execute<Rooms.Room>(
        () => api.room.createRoom({
          name: roomData.name,
          description: roomData.description,
          slug: generateSlug(roomData.name),
          settings: roomData.settings
        }),
        {
          onError: (error) => {
            state.error = error.message;
          }
        }
      );

      if (room) {
        // Join the newly created room
        await joinRoom(room.id);
      }

      state.loading = false;
      return room;
    } catch (error: any) {
      state.error = error?.message;
      state.loading = false;
      return null;
    }
  }

  // Helper function to generate a slug from a name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Queue actions
  async function joinQueue() {
    if (!state.currentRoom) return;

    try {
      // Use RPC for joining the queue (interactive action)
      await rpc.call(
        RPC.Methods.JOIN_QUEUE,
        { roomId: state.currentRoom.id }
      );

      // Queue update will come from the server
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  async function leaveQueue() {
    if (!state.currentRoom) return;

    try {
      // Use RPC for leaving the queue (interactive action)
      await rpc.call(
        RPC.Methods.LEAVE_QUEUE,
        { roomId: state.currentRoom.id }
      );

      // Queue update will come from the server
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  async function skipTrack() {
    if (!state.currentRoom || !state.isCurrentDJ) return;

    try {
      // Use RPC for skipping tracks (interactive action)
      await rpc.call(
        RPC.Methods.SKIP_CURRENT_TRACK,
        { roomId: state.currentRoom.id }
      );

      // Track skip event will come from the server
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  // Media actions
  async function voteOnMedia(vote: 'woot' | 'meh' | 'grab') {
    if (!state.currentRoom || !state.currentRoom.currentMedia) return;

    try {
      // Use RPC for voting (interactive action)
      await rpc.call(
        RPC.Methods.TRACK_VOTE,
        {
          roomId: state.currentRoom.id,
          mediaId: state.currentRoom.currentMedia.id,
          vote
        }
      );

      state.userVote = vote;
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  async function playMedia(mediaId: string) {
    if (!state.currentRoom || !state.isCurrentDJ) return;

    try {
      // Use RPC for playing media (interactive action)
      await rpc.call(
        RPC.Methods.PLAY_MEDIA,
        {
          roomId: state.currentRoom.id,
          mediaId
        }
      );

      // Track start event will come from the server
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  // Chat actions
  async function sendChatMessage(content: string) {
    if (!state.currentRoom) return;

    try {
      // Use RPC for chat messages (interactive action)
      await rpc.call(
        RPC.Methods.SEND_CHAT_MESSAGE,
        {
          roomId: state.currentRoom.id,
          content
        }
      );

      // Message will be echoed back through the chat message event
    } catch (error: any) {
      state.error = error?.message;
    }
  }

  // Data loading methods
  async function loadActiveRooms() {
    try {
      // Use API for data loading
      const rooms = await execute<Rooms.Room[]>(
        () => api.room.getActiveRooms(20),
        {
          onError: (error) => {
            state.error = error.message;
          }
        }
      );

      if (rooms) {
        state.roomList = rooms;
      }
      
      return rooms;
    } catch (error: any) {
      state.error = error?.message;
      return [];
    }
  }

  async function loadPopularRooms() {
    try {
      // Use API for data loading
      const rooms = await execute<Rooms.Room[]>(
        () => api.room.getPopularRooms(20),
        {
          onError: (error) => {
            state.error = error.message;
          }
        }
      );

      if (rooms) {
        state.popularRooms = rooms;
      }
      
      return rooms;
    } catch (error: any) {
      state.error = error?.message;
      return [];
    }
  }

  async function loadFavoriteRooms() {
    try {
      // Use API for data loading
      const rooms = await execute<Rooms.Room[]>(
        () => api.room.getFavoriteRooms(20),
        {
          onError: (error) => {
            state.error = error.message;
          }
        }
      );

      if (rooms) {
        state.favoriteRooms = rooms;
      }
      
      return rooms;
    } catch (error: any) {
      state.error = error?.message;
      return [];
    }
  }

  async function searchRooms(query: string) {
    try {
      state.loading = true;

      // Use API for searching
      const result = await execute<{rooms: Rooms.Room[], total: number}>(
        () => api.room.searchRooms(query),
        {
          onError: (error) => {
            state.error = error.message;
          }
        }
      );

      if (result) {
        state.searchResults = result.rooms;
      }

      state.loading = false;
      return result?.rooms || [];
    } catch (error: any) {
      state.error = error?.message;
      state.loading = false;
      return [];
    }
  }

  async function getRoomById(roomId: string) {
    try {
      // Use API for data loading
      return await execute<Rooms.Room>(
        () => api.room.getRoomById(roomId),
        {
          onError: (error) => {
            state.error = error.message;
          }
        }
      );
    } catch (error: any) {
      state.error = error?.message;
      return null;
    }
  }

  async function getRoomBySlug(slug: string) {
    try {
      // Use API for data loading
      return await execute<Rooms.Room[]>(
        () => api.room.getRoomBySlug(slug),
        {
          onError: (error) => {
            state.error = error.message;
          }
        }
      );
    } catch (error: any) {
      state.error = error?.message;
      return null;
    }
  }

  // Event handler implementations
  function handleRoomUpdate(data: Rooms.Room) {
    if (state.currentRoom && data.id === state.currentRoom.id) {
      Object.assign(state.currentRoom, data);
      updateUserQueueStatus();
    }
  }

  function handleUserJoinRoom(user: Users.Public) {
    if (!state.currentRoom) return;

    // Add user to room users list
    if (!state.currentRoom.users.some(u => u.id === user.id)) {
      state.currentRoom.users.push(user);
      state.currentRoom.activeUsers = state.currentRoom.users.length;
    }
  }

  function handleUserLeaveRoom(userId: string): void {
    if (!state.currentRoom) return;

    // Remove user from room users list
    const index = state.currentRoom.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      state.currentRoom.users.splice(index, 1);
      state.currentRoom.activeUsers = state.currentRoom.users.length;
    }
  }

  function handleNewMedia(data: {
    dj: Users.Public,
    media: Medias.Info,
    endTime: string,
    startTime: string,
  }): void {
    if (!state.currentRoom) return;

    // Update current media
    state.userVote = null;
    state.currentRoom.currentDJ = data.dj;
    state.currentRoom.currentMedia = data.media;
    state.currentRoom.mediaProgress = 0;
    state.currentRoom.mediaEndTime = data.endTime;
    state.currentRoom.mediaStartTime = data.startTime;

    // Add previous media to history if it exists
    if (data.media && data.dj) {
      const historyEntry: Rooms.PlayHistoryEntry = {
        media: data.media,
        dj: data.dj,
        playTime: data.startTime,
        woots: 0,
        mehs: 0,
        grabs: 0
      };

      // Add to beginning of history array
      state.currentRoom.playHistory.unshift(historyEntry);

      // Limit history length
      if (state.currentRoom.playHistory.length > 50) state.currentRoom.playHistory = state.currentRoom.playHistory.slice(0, 50);
    }
  }

  function updateMediaProgress(progress: number): void {
    if (state.currentRoom && state.currentRoom.currentMedia) {
      state.currentRoom.mediaProgress = Math.min(
        progress,
        state.currentRoom.currentMedia.duration
      );
    }
  }

  function updateUserQueueStatus(): void {
    if (!state.currentRoom) {
      state.isInQueue = false;
      state.isCurrentDJ = false;
      state.queuePosition = -1;
      return;
    }

    // Get the current user ID
    const { user: currentUser } = useUserStore();

    if (!currentUser) {
      state.isInQueue = false;
      state.isCurrentDJ = false;
      state.queuePosition = -1;
      return;
    }

    // Check if user is current DJ
    state.isCurrentDJ = state.currentRoom.currentDJ?.id === currentUser.id;

    // Check user's position in queue
    const queueEntry = state.currentRoom.djQueue.find(
      entry => entry.user.id === currentUser.id
    );

    if (queueEntry) {
      state.isInQueue = true;
      state.queuePosition = queueEntry.position;
    } else {
      state.isInQueue = false;
      state.queuePosition = -1;
    }
  }

  // Return everything that should be available outside the store
  return {
    // State
    ...toRefs(state),

    // Store initialization
    initialize,

    // Getters
    getRoomList,
    getDJQueue,
    getCurrentDJ,
    getRoomUsers,
    getCurrentRoom,
    getPlayHistory,
    getPopularRooms,
    getUserPosition,
    getCurrentMedia,
    getFavoriteRooms,
    getMediaProgress,
    getMediaRemaining,
    getMediaProgressPercent,

    // Room actions
    joinRoom,
    leaveRoom,
    createRoom,

    // Queue actions
    joinQueue,
    leaveQueue,
    skipTrack,

    // Media actions
    voteOnMedia,
    playMedia,

    // Chat actions
    sendChatMessage,

    // Data loading
    searchRooms,
    getRoomById,
    getRoomBySlug,
    loadActiveRooms,
    loadPopularRooms,
    loadFavoriteRooms,

    // Event handlers
    handleNewMedia,
    handleUserJoin: handleUserJoinRoom,
    handleUserLeave: handleUserLeaveRoom,
    handleRoomUpdate,
    updateMediaProgress,
    updateUserQueueStatus
  };
}), {
  // Default initialization options
  timeout: 10000,
  throwErrors: false,
  refreshInterval: undefined
});