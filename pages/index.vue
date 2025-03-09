<style lang="scss" scoped module>
.home {
  @apply flex flex-col container mx-auto p-3 sm:p-4 md:p-6 space-y-6 md:space-y-8 text-white;

  @media (max-width: 640px) {
    @apply px-2 py-4;
  }
}

// Section Title
.section-title {
  @apply flex justify-between items-center mb-4;

  h2 {
    @apply text-xl sm:text-2xl font-bold;
  }
  
  .refresh-button {
    @apply p-2 rounded-full bg-blue-600 bg-opacity-30 hover:bg-opacity-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500;
    
    &:disabled {
      @apply bg-black cursor-not-allowed;
    }
    
    .spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
}

// Featured Communities
.featured-communities {
  // Mobile: Stack vertically, full width
  @apply space-y-4;
  
  // Desktop: Grid layout like "All Communities"
  @media (min-width: 768px) {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0;
  }
}

// Community Grid
.community-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4;
}

// Loading and empty states
.loading-state, .empty-state {
  @apply col-span-full py-8 text-center text-gray-400;
}

// Custom scrollbar styles for the genre container
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}
</style>

<script lang="ts" setup>
import { LazyAppHomeWelcomeBanner } from '#components';
import type { Rooms } from '@/custom';

definePageMeta({
  requiresAuth: true,
  allowWhenLogged: true
});

const roomStore = useRoomStore();
const isRefreshing = ref(false);
const isPageActive = ref(true);
const lastRefreshTime = ref(Date.now());

// Use computed properties directly from the store
const roomsList = computed(() => roomStore.roomList as Rooms.Room[]);
const popularList = computed(() => roomStore.popularRooms as Rooms.Room[]);
const loading = computed(() => roomStore.loading);

// Set up auto-refresh and navigation tracking
let refreshInterval: number | null = null;
let visibilityHandler: (() => void) | null = null;

// Function to refresh data while preserving in-store content
const refreshData = async (force = false) => {
  // Don't refresh if already refreshing
  if (isRefreshing.value && !force) return;
  
  // Don't refresh if page isn't active and not forced
  if (!isPageActive.value && !force) return;
  
  // Throttle refreshes to prevent excessive calls
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime.value;
  if (timeSinceLastRefresh < 5000 && !force) return; // Minimum 5 seconds between refreshes
  
  try {
    isRefreshing.value = true;
    lastRefreshTime.value = now;

    // Load the data without clearing the existing data
    await Promise.all([
      roomStore.loadActiveRooms(),
      roomStore.loadPopularRooms()
    ]);
    
    // Ensure component is updated after data is loaded
    await nextTick();
  } catch (error) {
    console.error('Failed to refresh room data:', error);
  } finally {
    isRefreshing.value = false;
  }
};

// Track page visibility to manage refresh behavior
const setupVisibilityTracking = () => {
  // Handle tab/window visibility changes
  const handleVisibilityChange = () => {
    const isDocHidden = document.hidden;
    
    if (!isDocHidden && isPageActive.value) {
      // Tab became visible again, refresh data if it's been a while
      const timeSinceLastRefresh = Date.now() - lastRefreshTime.value;
      if (timeSinceLastRefresh > 60000) { // 1 minute
        refreshData(true);
      }
    }
  };
  
  // Add visibility listener
  document.addEventListener('visibilitychange', handleVisibilityChange);
  visibilityHandler = handleVisibilityChange;
};

// Initialize when component mounts
onMounted(async () => {
  isPageActive.value = true;
  
  // Only load data if the store is empty
  if (!roomsList.value.length || !popularList.value.length) {
    await refreshData(true);
  }
  
  // Set up refresh timer - only active when page is visible
  refreshInterval = window.setInterval(() => {
    if (isPageActive.value && document.visibilityState === 'visible') {
      refreshData();
    }
  }, 120000); // Refresh every 2 minutes
  
  // Setup visibility change tracking
  setupVisibilityTracking();
});

// Clean up when component unmounts
onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
  
  isPageActive.value = false;
});
</script>

<template>
  <div :class="$style.home">
    <LazyAppHomeWelcomeBanner />
    
    <!-- All Communities -->
    <div :class="$style['section-title']"> 
      <h2>All Communities</h2>
      <button @click="() => refreshData()" :class="$style['refresh-button']" :disabled="isRefreshing">
        <FontAwesomeIcon icon="sync" :class="[isRefreshing && $style.spin]" />
      </button>
    </div>

    <!-- Community Grid -->
    <div :class="$style['community-grid']">
      <LazyAppHomeCardsCommunity
        v-if="!loading && roomsList.length > 0"
        v-for="room in roomsList"
        :key="room.id"
        :name="room.name"
        :info="{ id: room.id, slug: room.slug, ...(room.stats || {}) }"
        :description="room.description"
      />
      <div v-else-if="loading && !roomsList.length" :class="$style['loading-state']">
        <p>Loading communities...</p>
      </div>
      <div v-else-if="!roomsList.length" :class="$style['empty-state']">
        <p>No communities found</p>
      </div>
    </div>

    <!-- Featured Communities -->
    <div :class="$style['section-title']">
      <h2>Featured Communities</h2>
    </div>

    <!-- Featured Community Cards -->
    <div :class="$style['featured-communities']">
      <!-- <HomeFeaturedCommunity
        v-if="!loading && popularList.length > 0"
        v-for="room in popularList"
        :key="room.id"
        :name="room.name"
        :info="{ id: room.id, slug: room.slug, ...(room.stats || {}) }"
        :description="room.description"
      /> -->
      <!-- <div v-else-if="loading && !popularList.length" class="loading-state">
        <p>Loading featured communities...</p>
      </div>
      <div v-else-if="!popularList.length" class="empty-state">
        <p>No featured communities found</p>
      </div> -->
    </div>
  </div>
</template>