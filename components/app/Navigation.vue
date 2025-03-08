

<script setup lang="ts">
// Track active navigation item
const activeNavItem = ref('music');

// Function to change active navigation item
const setActiveNavItem = (item: string) => {
  activeNavItem.value = item;
};

// Reference to sidebar element
const sidebar = useTemplateRef('sidebar');

// Sidebar width for other components to use
const sidebarWidth = ref(0);
provide('sidebarWidth', sidebarWidth);

// Inject player bar visibility state
const showPlayerBar = inject('showPlayerBar', ref(false));

// Set sidebar width on mount
function mounted(): void {
  watch(
    () => sidebar.value?.clientWidth,
    (n) => {
      if (n) {
        sidebarWidth.value = n;
      }
    }
  );

  if (sidebar.value && sidebar.value.clientWidth) {
    sidebarWidth.value = sidebar.value.clientWidth;
  }
}

onMounted(mounted);
</script>

<style lang="scss" scoped module>
.app-navigation {
  @apply w-full;

  /* Top Navigation Styles */
  .topbar {
    @apply fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 h-14;
    @apply bg-black z-20;

    .left-section {
      @apply flex items-center gap-4;
      @apply -ml-6;
      /* Space for sidebar */

      .logo {
        @apply flex items-center;
      }

      .about-btn {
        @apply flex items-center text-white text-opacity-70 text-sm px-3 py-1;
        @apply rounded-full bg-white/10 hover:bg-white/20 transition-colors;
      }

      .stat {
        @apply flex items-center text-white text-opacity-70 text-sm;
      }
    }

    .right-section {
      @apply flex items-center gap-4;

      .sign-up-btn {
        @apply bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium;
        @apply hover:bg-gray-100 transition-colors;
      }

      .chat-btn {
        @apply flex items-center text-white;
      }
    }
  }

  /* Sidebar Navigation Styles */
  .sidebar {
    @apply fixed left-0 top-0 bottom-0 w-16 bg-black/20 flex flex-col items-center z-10;
    @apply pt-14 pb-16;
    /* Space for top and player bar */
    @apply transition-all duration-300 ease-in-out;

    /* When player bar is not visible, remove bottom padding */
    &.no-player-bar {
      @apply pb-0;
    }

    .nav-item {
      @apply w-16 h-12 flex items-center justify-center text-white;
      @apply opacity-85 hover:opacity-100 transition-all duration-300 ease-in-out;
      @apply relative;
      @apply hover:bg-white/5;
      @apply border-r-0 border-transparent;

      &.active {
        @apply text-blue-400 border-r-4 border-blue-400;
        @apply bg-white/5;
      }

      .icon {
        @apply text-xl;
      }

      .notification-badge {
        @apply absolute top-4 right-2 bg-red-500 text-white text-xs;
        @apply w-4 h-4 flex items-center justify-center rounded-full;
      }
    }

    .bottom-section {
      @apply mt-auto;
    }
  }
}

/* Media queries */
@media (max-width: 768px) {
  .app-navigation {
    .topbar {
      .left-section {
        .stat {
          @apply hidden;
        }
      }
    }
  }
}
</style>

<template>
  <div :class="$style['app-navigation']">
    <!-- Top Navigation -->
    <div :class="$style.topbar">
      <div :class="$style['left-section']">
        <!-- Logo -->
        <div :class="$style.logo">
          <CommonBrandingLogo />
          <h1 class="text-white text-xl font-bold ml-2">SuperPlug Room</h1>
        </div>

        <!-- About community button -->
        <button :class="$style['about-btn']">
          <FontAwesomeIcon icon="fa-solid fa-info-circle" class="mr-2" />
          ABOUT COMMUNITY
        </button>

        <!-- Stats -->
        <div :class="$style.stat">
          <FontAwesomeIcon icon="fa-solid fa-star" class="mr-2" />
          1.3K
        </div>

        <div :class="$style.stat">
          <FontAwesomeIcon icon="fa-solid fa-eye" class="mr-2" />
          24,531
        </div>
      </div>

      <div :class="$style['right-section']">
        <button :class="$style['sign-up-btn']">
          Sign up Free
        </button>

        <button :class="$style['chat-btn']">
          <FontAwesomeIcon icon="fa-solid fa-comment-alt" class="mr-2" />
          Live Chat (211)
        </button>
      </div>
    </div>

    <!-- Sidebar Navigation -->
    <div ref="sidebar" :class="[$style.sidebar, !showPlayerBar && $style['no-player-bar']]">
      <!-- Music section -->
      <div 
        :class="[$style['nav-item'], activeNavItem === 'music' && $style.active]"
        @click="setActiveNavItem('music')"
        v-tippy="'Current room'"
      >
        <FontAwesomeIcon icon="fa-solid fa-music" :class="$style.icon" />
      </div>

      <!-- Dashboard -->
      <div 
        :class="[$style['nav-item'], activeNavItem === 'dashboard' && $style.active]"
        @click="setActiveNavItem('dashboard')"
        v-tippy="'Rooms'"
      >
        <FontAwesomeIcon icon="fa-solid fa-th" :class="$style.icon" />
      </div>
      
      <!-- Playlists -->
      <div 
        :class="[$style['nav-item'], activeNavItem === 'playlists' && $style.active]"
        @click="setActiveNavItem('playlists')"
        v-tippy="'Playlists'"
      >
        <FontAwesomeIcon icon="fa-solid fa-list" :class="$style.icon" />
      </div>
      
      <!-- Profile -->
      <div 
        :class="[$style['nav-item'], activeNavItem === 'profile' && $style.active]"
        @click="setActiveNavItem('profile')"
        v-tippy="'Your profile'"
      >
        <FontAwesomeIcon icon="fa-solid fa-user" :class="$style.icon" />
      </div>
      
      <!-- Store -->
      <div 
        :class="[$style['nav-item'], activeNavItem === 'store' && $style.active]"
        @click="setActiveNavItem('store')"
        v-tippy="'Store'"
      >
        <FontAwesomeIcon icon="fa-solid fa-shopping-cart" :class="$style.icon" />
      </div>
      
      <!-- Bottom section -->
      <div :class="$style['bottom-section']">
        <!-- Friends with notification -->
        <div 
          :class="[$style['nav-item'], activeNavItem === 'friends' && $style.active]"
          @click="setActiveNavItem('friends')"
          v-tippy="'Friends'"
        >
          <FontAwesomeIcon icon="fa-solid fa-users" :class="$style.icon" />
          <span :class="$style['notification-badge']">1</span>
        </div>
        
        <!-- Settings -->
        <div 
          :class="[$style['nav-item'], activeNavItem === 'settings' && $style.active]"
          @click="setActiveNavItem('settings')"
          v-tippy="'Help & Settings'"
        >
          <FontAwesomeIcon icon="fa-solid fa-cog" :class="$style.icon" />
        </div>
      </div>
    </div>
  </div>
</template>