<style lang="scss" scoped module>
.listenify {
  @apply h-screen w-full flex flex-col relative;

  .content {
    @apply flex-1 overflow-hidden;
    @apply pt-14; /* Top nav spacing */
    @apply pl-16; /* Sidebar spacing */
    @apply pb-0; /* No default bottom padding */
    @apply transition-all duration-300 ease-in-out;
    @apply bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900;
    
    &.with-player-bar {
      @apply pb-16; /* Player bar spacing only when player bar is shown */
    }
  }

  .app {
    @apply h-full w-full flex flex-col relative overflow-auto;
  }
}
</style>

<script lang="ts" setup>
import { LazyAppPlayerBar } from '#components';
import { initJSONRPCService } from '@/custom';

const config = useAppConfig();
const { isVisible } = usePlayerStore();
const { token, isAuthenticated } = useUserStore();

function initializeRPC(token: string): void {
  if (!isAuthenticated)
    return;

  // initialize RPC
  initJSONRPCService({ url: config.WS_URL, token, debug: !config.IS_PRODUCTION });
}

function mounted(): void {
  initializeRPC(token!);
}

onMounted(mounted);
</script>

<template>
  <div :class="$style.listenify">
    <AppNavigation />
    <div :class="[$style.content, isVisible && $style['with-player-bar']]">
      <div :class="$style.app">
        <slot></slot>
      </div>
    </div>
    <LazyAppPlayerBar />
  </div>
</template>