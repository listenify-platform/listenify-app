<style lang="scss" scoped module>
.app {
  @apply min-h-screen h-screen w-full;
}
</style>

<template>
  <div :class="$style.app">
    <slot />
  </div>
</template>