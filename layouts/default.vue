<style lang="scss" scoped module>
.app {
  @apply min-h-screen h-screen w-full;
}
</style>

<script lang="ts" setup>
import { initJSONRPCService } from '@/custom';

const config = useAppConfig();
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
  <div :class="$style.app">
    <AppNavigation />
    <slot />
  </div>
</template>