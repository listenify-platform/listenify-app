<style lang="scss" scoped module>
.welcome-banner {
  @apply flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-4 md:p-6 mb-6 md:mb-8;

  .welcome-content {
    @apply mb-4 md:mb-0;

    .welcome-title {
      @apply text-xl sm:text-2xl font-bold mb-1 sm:mb-2;
    }

    .welcome-message {
      @apply text-sm sm:text-base text-gray-200 max-w-2xl;
    }
  }

  .welcome-stats {
    @apply flex items-center justify-between w-full md:w-auto space-x-3 sm:space-x-6 mt-2 md:mt-0;

    .stat-item {
      @apply flex flex-col items-center;

      .stat-value {
        @apply text-lg sm:text-2xl font-bold;
      }

      .stat-label {
        @apply text-xs sm:text-sm text-gray-300;
      }
    }
  }
}
</style>

<script setup lang="ts">
const { user, followers } = useUserStore();
</script>

<template>
  <div :class="$style['welcome-banner']">
    <div :class="$style['welcome-content']">
      <h1 :class="$style['welcome-title']" v-text="user ? `Welcome back, ${user.username}` : 'Hello there'"></h1>
      <p :class="$style['welcome-message']">We are glad to see you again! Keep up the good work and continue to grow your connections.</p>
    </div>

    <!-- Stats -->
    <div :class="$style['welcome-stats']">
      <div :class="$style['stat-item']">
        <span :class="$style['stat-value']" v-text="user?.stats.level"></span>
        <span :class="$style['stat-label']">level</span>
      </div>
      <div :class="$style['stat-item']">
        <span :class="$style['stat-value']" v-text="user?.stats.points"></span>
        <span :class="$style['stat-label']">points</span>
      </div>
      <div :class="$style['stat-item']">
        <span :class="$style['stat-value']" v-text="followers.length"></span>
        <span :class="$style['stat-label']">followers</span>
      </div>
    </div>
  </div>
</template>