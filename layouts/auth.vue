<style lang="scss" scoped module>
.auth {
  @apply flex flex-col lg:flex-row h-screen w-full;
}
</style>

<template>
  <div :class="$style.auth">
    <slot />
  </div>
</template>