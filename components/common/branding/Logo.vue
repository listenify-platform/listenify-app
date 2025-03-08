<template>
  <div
    :class="
      [
        $style.logo,
        size === 'big' && $style.big,
        color === 'black' && $style.black
      ]
    "
  >
  </div>
</template>

<script lang="ts" setup>
// Props
defineProps({
  size: {
    type: String,
    validator: (value: string) => ['small', 'big'].includes(value),
    default: 'small'
  },
  color: {
    type: String,
    validator: (value: string) => ['white', 'black'].includes(value),
    default: 'white'
  }
});
</script>

<style lang="scss" module scoped>
.logo {
  @apply inline-block bg-white;

  &.big {
    @apply h-24 w-96;
  }

  &.black {
    @apply bg-black;
  }

  -webkit-mask: url(@/assets/img/logo.svg) no-repeat center / contain;
  mask: url(@/assets/img/logo.svg) no-repeat center / contain;
  @apply h-8 w-32;
}
</style>