<script setup lang="ts">
import { computed } from 'vue';

interface ButtonProps {
  /**
   * Button type
   */
  type?: 'submit' | 'button' | 'reset';
  
  /**
   * Loading state of the button
   */
  loading?: boolean;
  
  /**
   * Disabled state of the button
   */
  disabled?: boolean;
  
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'discord' | 'danger' | 'text';
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'button',
  loading: false,
  disabled: false,
  variant: 'primary',
  fullWidth: true,
  size: 'md'
});

const emit = defineEmits(['click']);

// Handle button click with loading protection
const handleClick = (event: MouseEvent) => {
  if (props.loading || props.disabled) {
    event.preventDefault();
    return;
  }
  
  emit('click', event);
};

// Computed classes based on props
const buttonClasses = computed(() => {
  const classes = ['button'];
  
  // Add variant classes
  classes.push(`button__${props.variant}`);
  
  // Add size classes
  classes.push(`button__${props.size}`);
  
  // Add full width class
  if (props.fullWidth) {
    classes.push('button__full');
  }
  
  // Add loading class
  if (props.loading) {
    classes.push('button__loading');
  }
  
  // Add disabled class
  if (props.disabled) {
    classes.push('button__disabled');
  }
  
  return classes.join(' ');
});

// Computed disabled state
const isDisabled = computed(() => {
  return props.disabled || props.loading;
});
</script>

<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="button__spinner">
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    
    <!-- Button content -->
    <span class="button__content">
      <slot></slot>
    </span>
  </button>
</template>

<style lang="scss" scoped>
.button {
  @apply flex items-center justify-center px-4 font-medium rounded transition-all duration-200 relative;
  
  /* Pseudo-element for loading overlay */
  &::before {
    @apply absolute inset-0 bg-black/0 rounded transition-opacity duration-200 pointer-events-none;
    content: '';
  }
  
  /* Hover effect */
  &:hover:not(.button__disabled):not(.button__loading) {
    @apply scale-[1.02] shadow-sm;
  }
  
  /* Active effect */
  &:active:not(.button__disabled):not(.button__loading) {
    @apply scale-[0.98];
  }
  
  /* Loading state */
  &.button__loading {
    &::before {
      @apply bg-black/20;
    }
    
    .button__content {
      @apply opacity-80;
    }
  }
  
  /* Disabled state */
  &.button__disabled {
    @apply cursor-not-allowed;
    
    &::before {
      @apply bg-black/30;
    }
    
    .button__content {
      @apply opacity-50;
    }
  }
  
  /* Size variants */
  &.button__sm {
    @apply py-1 text-xs;
  }
  
  &.button__md {
    @apply py-2 text-sm;
  }
  
  &.button__lg {
    @apply py-3 text-base;
  }
  
  /* Full width */
  &.button__full {
    @apply w-full;
  }
  
  /* Color variants */
  &.button__primary {
    @apply bg-white text-black hover:bg-gray-200;
  }
  
  &.button__secondary {
    @apply bg-gray-700 text-white hover:bg-gray-600;
  }
  
  &.button__discord {
    @apply bg-indigo-700 text-white hover:bg-indigo-600;
  }
  
  &.button__danger {
    @apply bg-red-600 text-white hover:bg-red-500;
  }
  
  &.button__text {
    @apply bg-transparent text-white hover:bg-white/10;
    
    &.button__disabled {
      @apply hover:bg-transparent;
    }
  }
  
  /* Content alignment */
  .button__content,
  .button__spinner {
    @apply flex items-center justify-center;
  }
}
</style>