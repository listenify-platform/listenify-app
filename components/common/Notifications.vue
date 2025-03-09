

<style lang="scss" scoped>
.notification {
  @apply flex items-start bg-gray-800 rounded-md relative overflow-hidden;
  @apply p-3 mb-3 transition-all duration-300 transform;
  @apply border border-gray-700;
  
  /* Success variant */
  &.success {
    @apply border-green-600 bg-green-900;
  }
  
  /* Warning variant */
  &.warning {
    @apply border-yellow-600 bg-yellow-900;
  }
  
  /* Error variant */
  &.error {
    @apply border-red-600 bg-red-900;
  }
}

.notification-content {
  @apply flex-1 min-w-0;
}

.notification-title {
  @apply font-medium text-sm mb-1;
  
  p {
    @apply text-xs mt-1 mb-0;
  }
}

.notification-text {
  @apply text-xs leading-relaxed;
}

.notification-close {
  @apply flex items-center justify-center w-6 h-6 rounded-sm cursor-pointer ml-2 transition-colors;
  @apply hover:bg-white/20 hover:text-gray-200;
}
</style>

<template>
  <AppNotifications class="p-4" :width="380" :duration="7500" position="top right" dangerously-set-inner-html>
    <template #body="{ item, close }">
      <div :class="['notification', item.type]">
        <div class="notification-content">
          <div class="notification-title" v-if="item.title" v-text="item.title"></div>
          <div class="notification-text" v-text="item.text"></div>
        </div>
        <div class="notification-close" @click="close">
          <FontAwesomeIcon icon="times" />
        </div>
      </div>
    </template>
  </AppNotifications>
</template>