<style lang="scss" scoped module>
.community-card {
  @apply bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all duration-300 relative cursor-pointer;

  &.joining {
    @apply cursor-wait;
  }

  .community-image-container {
    @apply relative;

    .community-image {
      @apply w-full h-40 sm:h-48 object-cover;
    }

    .community-overlay {
      @apply absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent opacity-50 p-3 sm:p-4;

      .community-name {
        @apply text-base sm:text-lg font-bold;
      }

      .community-description {
        @apply text-xs sm:text-sm text-gray-300 line-clamp-2;
      }
    }

    .community-stats {
      @apply absolute top-2 right-2 flex space-x-2;

      .stat-badge {
        @apply bg-black bg-opacity-70 rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 flex items-center text-xs sm:text-sm;
      }
    }

    .loading-overlay {
      @apply absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center;
      
      .spinner {
        @apply w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin;
      }
    }
  }

  .active-indicator {
    @apply absolute bottom-0 left-0 right-0 bg-blue-500  text-xs text-center py-1;
  }
}
</style>

<script setup lang="ts">
const props = defineProps({
  name: {
    type: String,
    default: 'Community Name',
    required: false,
  },
  info: {
    type: Object,
    default: () => ({
      id: 'community-id',
      slug: 'community-slug',
      totalUsers: 0,
      activeUsers: 0,
    }),
    required: false,
  },
  imageUrl: {
    type: String,
    default: 'https://placehold.co/640x360',
    required: false,
  },
  description: {
    type: String,
    default: 'Community Description',
    required: false,
  }
});

const roomStore = useRoomStore();
const userStore = useUserStore();
const isJoining = ref<boolean>(false);

// Check if user is in this specific room
const isUserInRoom = computed(() => {
  // If we have a current room and it matches this card's room
  if (roomStore.currentRoom && roomStore.currentRoom.id === props.info.id) {
    return true;
  }
  
  // If the current user ID is in the room's users list
  if (roomStore.currentRoom?.users && userStore.user) {
    return roomStore.currentRoom.users.some(user => user.id === userStore.user?.id);
  }
  
  return false;
});

// Computed property for the active state (used by the data-active attribute)
const isActive = computed(() => isUserInRoom.value);

// Watch for changes to the current room to update our status
watch(() => roomStore.currentRoom?.id, () => {
  // This will update our isUserInRoom computed property
}, { immediate: true });
</script>

<template>
  <NuxtLink :to="`/rooms/${props.info.slug || props.info.id}`" :class="[$style['community-card'], isJoining && $style['joining']]">
    <div :class="$style['community-image-container']">
      <img :src="imageUrl" :alt="name" :class="$style['community-image']" />
      <div :class="$style['community-overlay']">
        <h3 :class="$style['community-name']" v-text="name"></h3>
        <p :class="$style['community-description']" v-text="description"></p>
      </div>
      <div :class="$style['community-stats']">
        <div :class="$style['stat-badge']">
          <FontAwesomeIcon icon="eye" class="mr-2" />
          <span v-text="info.totalUsers"></span>
        </div>
        <div :class="$style['stat-badge']">
          <FontAwesomeIcon icon="users" class="mr-2" />
          <span v-text="info.activeUsers"></span>
        </div>
      </div>
      <div v-if="isJoining" :class="$style['loading-overlay']">
        <div :class="$style['spinner']"></div>
      </div>
    </div>
    <div v-if="isActive" :class="$style['active-indicator']">
      <span>You're in this room</span>
    </div>
  </NuxtLink>
</template>