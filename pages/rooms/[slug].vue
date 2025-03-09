<template>
  <div :class="$style.roomContainer">
    <!-- Loading state -->
    <div v-if="isLoading" :class="$style.loadingOverlay">
      <div :class="$style.loadingContent">
        <div :class="$style.loadingSpinner"></div>
        <p :class="$style.loadingText">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Room not found state -->
    <div v-else-if="roomNotFound" :class="$style.notFoundContainer">
      <div :class="$style.notFoundContent">
        <div :class="$style.notFoundIcon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2 :class="$style.notFoundTitle">Room Not Found</h2>
        <p :class="$style.notFoundText">The room you're looking for doesn't exist or is no longer available.</p>
        <button @click="navigateToHome" :class="$style.notFoundButton">
          Return to Home
        </button>
      </div>
    </div>

    <!-- Main room content -->
    <div v-else :class="$style.roomContent">
      <!-- Virtual Room with Canvas -->
      <div :class="$style.mainArea">
        <!-- Background with 3D effect -->
        <div :class="$style.backgroundGradient"></div>

        <!-- Visual elements -->
        <div :class="$style.visualElements">
          <!-- Pink beams -->
          <div :class="$style.beamOne"></div>
          <div :class="$style.beamTwo"></div>

          <!-- Geometric shapes -->
          <div :class="$style.cornerShape"></div>
          <div :class="$style.floatingCircle"></div>
          <div :class="$style.floatingSquare"></div>

          <!-- Desert scene elements -->
          <div :class="$style.desertElementOne"></div>
          <div :class="$style.desertElementTwo"></div>
          <div :class="$style.desertElementThree"></div>
          <div :class="$style.desertElementFour"></div>
        </div>

        <LazyRoomCanvasAudience ref="audienceView" :current-user="user!" :users-data="currentRoom.users" :enable-animation="true" />

        <!-- Controls overlay -->
        <div :class="$style.controlsOverlay">
          <div :class="$style.mainControls">
            <button :class="$style.playButton" @click="handlePlaySong">
              <i class="fas fa-play" :class="$style.playIcon"></i>
              PLAY A SONG
            </button>

            <div :class="$style.avatarList">
              <div :class="$style.avatarItem" v-for="(user, index) in activeUsers.slice(0, 5)" :key="index">
                <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.username" :class="$style.avatarImage" />
                <span v-else :class="$style.avatarPlaceholder">
                  {{ getUserInitials(user) }}
                </span>
              </div>
              <div v-if="activeUsers.length > 5" :class="$style.moreUsers">
                +{{ activeUsers.length - 5 }}
              </div>
            </div>
          </div>

          <div :class="$style.roomStats">
            <div :class="$style.statItem">
              <button :class="[$style.statButton, userVote === 'woot' ? $style.votedWoot : '']" @click="vote('woot')">
                <i class="fas fa-thumbs-up" :class="$style.statIcon"></i>
              </button>
              <span :class="$style.statValue">{{ roomStats.woots || 0 }}</span>
            </div>

            <div :class="$style.statItem">
              <button :class="[$style.statButton, userVote === 'meh' ? $style.votedMeh : '']" @click="vote('meh')">
                <i class="fas fa-thumbs-down" :class="$style.statIcon"></i>
              </button>
              <span :class="$style.statValue">{{ roomStats.mehs || 0 }}</span>
            </div>

            <div :class="$style.statItem">
              <button :class="[$style.statButton, userVote === 'grab' ? $style.votedGrab : '']" @click="vote('grab')">
                <i class="fas fa-list" :class="$style.statIcon"></i>
              </button>
              <span :class="$style.statValue">{{ roomStats.grabs || 0 }}</span>
            </div>

            <div :class="$style.progressBarContainer">
              <div :class="$style.progressBar" :style="{width: `${songProgress}%`}"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat panel -->
      <RoomChatboxMain
        :messages="chatMessages" 
        @send-message="sendChatMessage" 
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { LazyRoomCanvasAudience, RoomCanvasAudience, RoomChatboxMain } from '#components';
import { RPC, type Chat, type Users } from '@/custom';

// Route and navigation
const route = useRoute();
const router = useRouter();
const slug = computed(() => route.params.slug as string);

// Store access
const roomStore = useRoomStore();
const userStore = useUserStore();
const { user } = userStore;

// Component state
const isLoading = ref(true);
const loadingMessage = ref('Loading room...');
const roomNotFound = ref(false);
const audienceView = ref<typeof RoomCanvasAudience | null>(null);
const chatMessages = ref<Chat.Message[]>([]);
const userVote = ref<'woot' | 'meh' | 'grab' | null>(null);
const isComponentActive = ref(true); // Track if component is in the foreground

// Room data
const activeUsers = computed(() => roomStore.getRoomUsers || []);
const currentRoom = computed(() => roomStore.getCurrentRoom || { users: [] as Users.Public[] });
const roomStats = computed(() => ({
  woots: currentRoom.value?.stats?.woots || 0,
  mehs: currentRoom.value?.stats?.mehs || 0,
  grabs: currentRoom.value?.stats?.grabs || 0
}));

// Song playback state
const songProgress = computed(() => {
  if (!currentRoom.value?.currentMedia) return 0;
  return roomStore.getMediaProgressPercent;
});

// Load room data
const loadRoom = async () => {
  try {
    isLoading.value = true;
    loadingMessage.value = 'Validating room...';
    
    // First check if the room exists by slug
    const room = await roomStore.getRoomBySlug(slug.value);
    
    if (!room) {
      roomNotFound.value = true;
      isLoading.value = false;
      return;
    }
    
    // Check if we're already in this room
    const isAlreadyInRoom = currentRoom.value && currentRoom.value.id === room.id;
    
    if (!isAlreadyInRoom) {
      loadingMessage.value = 'Joining room...';
      console.log(room);
      await roomStore.joinRoom(room.id);
    }
    
    // Start polling for room updates
    startRoomUpdates();
    
    // Check if user has already voted
    userVote.value = roomStore.userVote;
    
  } catch (error) {
    console.error('Failed to load room:', error);
    loadingMessage.value = 'Error loading room';
    setTimeout(() => {
      roomNotFound.value = true;
      isLoading.value = false;
    }, 2000);
  } finally {
    isLoading.value = false;
  }
};

// Navigation
const navigateToHome = () => {
  router.push('/');
};

// Room interaction methods
const handlePlaySong = async () => {
  // Check if user is current DJ
  if (!roomStore.isCurrentDJ) {
    // Show dialog about joining DJ queue
    // For now, just try to join queue
    await roomStore.joinQueue();
    return;
  }
  
  // If user is DJ, show song selection
  // This would open a dialog or navigate to song selection
  console.log('Open song selection');
};

const vote = async (voteType: 'woot' | 'meh' | 'grab') => {
  if (!currentRoom.value?.currentMedia) return;
  
  try {
    // Toggle vote if clicking the same one again
    if (userVote.value === voteType) {
      // In a real app, you would implement vote removal
      // For now, just toggle the UI
      userVote.value = null;
      return;
    }
    
    userVote.value = voteType;
    await roomStore.voteOnMedia(voteType);
  } catch (error) {
    console.error('Failed to vote:', error);
    // Reset vote on error
    userVote.value = roomStore.userVote;
  }
};

const sendChatMessage = async (message: string) => {
  if (!message.trim() || !currentRoom.value) return;
  
  try {
    await roomStore.sendChatMessage(message);
    // The message will be added via the RPC event handler
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};

// Define RPC event handlers with proper wrapper functions
function handleUserJoin(data: { roomId: string, user: Users.Public }) {
  if (!currentRoom.value || data.roomId !== currentRoom.value.id) return;
  
  // Call the exposed method on the audience component
  if (audienceView.value) {
    audienceView.value.addUser(data.user);
  }
}

function handleUserLeave(data: { roomId: string, userId: string }) {
  if (!currentRoom.value || data.roomId !== currentRoom.value.id) return;
  
  // Call the exposed method on the audience component
  if (audienceView.value) {
    audienceView.value.removeUser(data.userId);
  }
}

// Handle chat messages from RPC
function handleChatMessage(data: { roomId: string, message: Chat.Message }) {
  if (!currentRoom.value || data.roomId !== currentRoom.value.id) return;
  
  // Add message to chat
  chatMessages.value.push(data.message);
}

// Helper methods
const getUserInitials = (user: Users.Public) => {
  if (!user.username) return '?';
  return user.username.charAt(0).toUpperCase();
};

// Room updates polling
let updateInterval: number | null = null;
const startRoomUpdates = () => {
  if (updateInterval) return;
  
  // Update song progress every second
  updateInterval = window.setInterval(() => {
    // Only update if component is active or if we're the current DJ
    if ((isComponentActive.value || roomStore.isCurrentDJ) && 
        currentRoom.value?.currentMedia && 
        roomStore.currentRoom?.mediaProgress !== undefined) {
      roomStore.updateMediaProgress(roomStore.currentRoom.mediaProgress + 1);
    }
  }, 1000);
};

const stopRoomUpdates = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
};

/**
 * Pause non-essential room updates
 * This keeps the room connection active but reduces
 * unnecessary UI updates when in the background
 */
const pauseRoomUpdates = () => {
  isComponentActive.value = false;
  
  // We can optionally reduce the update frequency here
  // but keep the connection alive
  
  // Note: We keep the interval running but the update
  // logic will check isComponentActive before updating
};

/**
 * Resume normal room updates
 */
const resumeRoomUpdates = () => {
  isComponentActive.value = true;
  
  // Restart interval if needed
  if (!updateInterval) {
    startRoomUpdates();
  }
};

// Lifecycle hooks
onMounted(async () => {
  const rpc = useRpc();

  // Load the room data
  await loadRoom();

  // Bind RPC events using wrapper functions
  rpc.on(RPC.Methods.USER_JOINED_ROOM, handleUserJoin);
  rpc.on(RPC.Methods.USER_LEFT_ROOM, handleUserLeave);
  rpc.on(RPC.Methods.ROOM_CHAT_MESSAGE, handleChatMessage);
  
  // Set up event listeners
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('blur', handleWindowBlur);
});

// Cleanup on final unmount (component destroyed, not just deactivated)
onUnmounted(() => {
  const rpc = useRpc();

  // Remove RPC event handlers
  rpc.off(RPC.Methods.USER_JOINED_ROOM);
  rpc.off(RPC.Methods.USER_LEFT_ROOM);
  rpc.off(RPC.Methods.ROOM_CHAT_MESSAGE);
  
  // Clean up intervals but keep room connection
  stopRoomUpdates();
  window.removeEventListener('focus', handleWindowFocus);
  window.removeEventListener('blur', handleWindowBlur);
});

// Vue keep-alive lifecycle hooks
onActivated(() => {
  // Component is re-activated (e.g. navigated back to this page)
  resumeRoomUpdates();
});

onDeactivated(() => {
  // Component is deactivated but kept in memory (e.g. navigated away)
  // We don't leave the room, just pause unnecessary updates
  pauseRoomUpdates();
});

// Visibility handling
const handleWindowFocus = () => {
  // Resume updates when window gains focus
  if (isComponentActive.value) {
    startRoomUpdates();
  }
};

const handleWindowBlur = () => {
  // Pause updates when window loses focus
  // but only if we're not the current DJ
  if (!roomStore.isCurrentDJ) {
    stopRoomUpdates();
  }
};

// Watch for slug changes to reload the room
watch(() => route.params.slug, async (newSlug, oldSlug) => {
  if (newSlug !== oldSlug) {
    // If changing to a different room, leave the current one first
    if (currentRoom.value) {
      await roomStore.leaveRoom();
    }
    await loadRoom();
  }
});

// Page definition
definePageMeta({
  requiresAuth: true
})
</script>

<style lang="scss" module>
.roomContainer {
  @apply h-full w-full flex flex-col relative overflow-hidden;
}

.loadingOverlay {
  @apply absolute inset-0 bg-black/80 flex justify-center items-center z-50 backdrop-blur-sm;
}

.loadingContent {
  @apply flex flex-col items-center gap-4;
}

.loadingSpinner {
  @apply w-12 h-12 border-4 border-white/20 border-t-white rounded-full;
  animation: spin 1s linear infinite;
}

.loadingText {
  @apply text-white text-lg font-medium;
}

.notFoundContainer {
  @apply flex justify-center items-center h-full bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900;
}

.notFoundContent {
  @apply max-w-lg p-8 text-center bg-white/10 backdrop-blur-md rounded-xl flex flex-col gap-4;
}

.notFoundIcon {
  @apply text-5xl text-red-400 mb-4;
}

.notFoundTitle {
  @apply text-2xl font-bold text-white;
}

.notFoundText {
  @apply text-gray-300 mb-6;
}

.notFoundButton {
  @apply py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors;
}

.roomContent {
  @apply flex-1 flex relative;
}

.mainArea {
  @apply flex-1 relative overflow-hidden;
}

.backgroundGradient {
  @apply absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900 opacity-70;
}

.visualElements {
  @apply absolute inset-0 z-0;
}

.beamOne {
  @apply absolute top-1/4 left-0 right-0 h-96 bg-pink-600/20 transform -skew-y-6;
}

.beamTwo {
  @apply absolute top-1/3 left-0 right-0 h-96 bg-pink-600/10 transform skew-y-6;
}

.cornerShape {
  @apply absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-r from-orange-500 to-pink-500 rounded-tl-full opacity-50;
}

.floatingCircle {
  @apply absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20;
}

.floatingSquare {
  @apply absolute top-40 left-1/4 w-24 h-24 border-2 border-yellow-500/30 rounded-md transform rotate-45;
}

.desertElementOne {
  @apply absolute bottom-0 left-20 w-40 h-60 bg-orange-800/50 rounded-t-full;
}

.desertElementTwo {
  @apply absolute bottom-0 right-40 w-20 h-80 bg-green-800/50 rounded-t-lg;
}

.desertElementThree {
  @apply absolute bottom-0 right-60 w-8 h-12 bg-green-800/50 rounded-t-lg;
}

.desertElementFour {
  @apply absolute bottom-0 right-20 w-12 h-20 bg-green-800/50 rounded-t-lg;
}

.controlsOverlay {
  @apply absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-8 z-30;
}

.mainControls {
  @apply bg-black/80 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-3;

  .playButton {
    @apply bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-md text-white font-semibold flex items-center;
  }

  .playIcon {
    @apply mr-2;
  }

  .avatarList {
    @apply flex gap-2;
  }

  .avatarItem {
    @apply w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden;
  }

  .avatarImage {
    @apply w-6 h-6 rounded-full object-cover;
  }

  .avatarPlaceholder {
    @apply text-white text-sm font-medium;
  }

  .moreUsers {
    @apply w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white text-xs font-semibold;
  }
}

.roomStats {
  @apply bg-black/80 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-6;

  .statItem {
    @apply flex items-center gap-1 text-white;
  }

  .statButton {
    @apply hover:text-blue-400 transition-colors;

    &.votedWoot {
      @apply text-green-400;
    }

    &.votedMeh {
      @apply text-red-400;
    }

    &.votedGrab {
      @apply text-purple-400;
    }
  }

  .statIcon {
    @apply text-lg;
  }

  .statValue {
    @apply text-sm font-medium;
  }

  .progressBarContainer {
    @apply w-36 h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full overflow-hidden;
  }

  .progressBar {
    @apply h-full bg-white/30 rounded-full transition-all duration-1000;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>