<template>
  <div :class="$style.app">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss" scoped module>
.app {
  @apply min-h-screen h-screen w-full;
}
</style>