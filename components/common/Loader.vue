<script setup lang="ts">
const nuxt = useNuxtApp();
const text = ref<string | null>(null);
const isLoading = ref<boolean>(true);
const progress = ref<number>(0);
const loadingType = ref<'default' | 'content' | 'api' | 'upload'>('default');

// Optional props to customize behavior
const props = defineProps({
  showProgress: {
    type: Boolean,
    default: false
  },
  minDisplayTime: {
    type: Number,
    default: 500
  },
  color: {
    type: String,
    default: '#1DB954' // Spotify-like green
  }
});

// Expose methods to be used by parent components
const showLoader = (loadingText?: string, type: 'default' = 'default') => {
  text.value = loadingText || null;
  loadingType.value = type;
  isLoading.value = true;
};

const hideLoader = () => {
  isLoading.value = false;
  progress.value = 0;
};

const updateProgress = (value: number) => {
  progress.value = Math.min(Math.max(value, 0), 100);
};

// Track when loading started to enforce minimum display time
let loadingStartTime = 0;

// Page navigation hooks
nuxt.hook("page:start", () => { 
  loadingStartTime = Date.now();
  loadingType.value = 'default';
  progress.value = 0;
  isLoading.value = true; 
});

nuxt.hook("page:finish", () => { 
  const elapsed = Date.now() - loadingStartTime;
  const remainingTime = Math.max(0, props.minDisplayTime - elapsed);
  
  // Ensure loader displays for at least minDisplayTime
  if (remainingTime > 0) {
    setTimeout(() => {
      isLoading.value = false;
    }, remainingTime);
  } else {
    isLoading.value = false;
  }
});

// Expose methods to be used by other components via template refs
defineExpose({
  showLoader,
  hideLoader,
  updateProgress
});
</script>

<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-screen" :data-type="loadingType">
      <div class="loading-content">
        <div class="loading-spinner">
          <svg v-if="!showProgress" class="spinner" viewBox="0 0 50 50">
            <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" :style="{ stroke: color }"></circle>
          </svg>
          
          <svg v-else class="progress-circle" viewBox="0 0 36 36">
            <path
              class="progress-circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke-width="3"
              stroke="rgba(255, 255, 255, 0.2)"
            />
            <path
              class="progress-circle-path"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke-width="3"
              :stroke="color"
              :stroke-dasharray="`${progress}, 100`"
            />
            <text x="18" y="20.5" class="progress-text">{{ progress }}%</text>
          </svg>
        </div>
        <div class="loading-text" v-text="text || 'Loading'"></div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.loading {
  &-screen {
    @apply fixed inset-0 w-full h-full flex backdrop-blur-2xl justify-center items-center z-50;
  }
  
  &-content {
    @apply flex flex-col items-center;
    gap: 1.5rem;
  }
  
  &-text {
    @apply text-white text-xl font-medium lowercase tracking-wider;
  }
  
  &-spinner {
    @apply w-16 h-16;
  }
}

.spinner {
  @apply w-full h-full;
  animation: rotate 2s linear infinite;
  
  &-path {
    @apply rounded-full;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
}

.progress-circle {
  @apply w-full h-full;
  
  &-path {
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
  }
}

.progress-text {
  fill: white;
  font-size: 10px;
  text-anchor: middle;
  font-family: sans-serif;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Fade transition for smooth loading screen appearance/disappearance */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-[300ms] ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style>