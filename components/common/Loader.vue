<script setup lang="ts">
const nuxt = useNuxtApp();
const router = useRouter();
const route = useRoute();

const text = ref<string | null>(null);
const isLoading = ref<boolean>(true);
const progress = ref<number>(0);
const loadingType = ref<'default' | 'content' | 'api' | 'upload' | 'component' | 'route'>('default');
const currentRoutePath = ref<string>('');

// For tracking component loading
const pendingComponents = ref<Set<string>>(new Set());

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
    default: '#60a5fa' // Spotify-like green
  }
});

// Track when loading started to enforce minimum display time
let loadingStartTime = 0;

// Expose methods to be used by parent components
const showLoader = (loadingText?: string, type: 'default' | 'content' | 'api' | 'upload' | 'component' | 'route' = 'default') => {
  text.value = loadingText || null;
  loadingType.value = type;
  isLoading.value = true;
  loadingStartTime = Date.now();
};

const hideLoader = (force = false) => {
  const elapsed = Date.now() - loadingStartTime;
  const remainingTime = Math.max(0, props.minDisplayTime - elapsed);
  
  // If there are still components loading, don't hide unless forced
  if (!force && pendingComponents.value.size > 0) {
    return;
  }
  
  // Ensure loader displays for at least minDisplayTime
  if (remainingTime > 0 && !force) {
    setTimeout(() => {
      isLoading.value = false;
      progress.value = 0;
    }, remainingTime);
  } else {
    isLoading.value = false;
    progress.value = 0;
  }
};

const updateProgress = (value: number) => {
  progress.value = Math.min(Math.max(value, 0), 100);
};

// Component loading tracking
const registerComponentLoading = (componentId: string) => {
  pendingComponents.value.add(componentId);
  if (!isLoading.value) {
    showLoader('Loading component...', 'component');
  }
};

const unregisterComponentLoading = (componentId: string) => {
  pendingComponents.value.delete(componentId);
  if (pendingComponents.value.size === 0 && loadingType.value === 'component') {
    hideLoader();
  }
};

// Page navigation hooks (already in your code, enhanced)
nuxt.hook("page:start", () => { 
  loadingStartTime = Date.now();
  if (loadingType.value !== 'route') { // Don't override if route loading is active
    loadingType.value = 'default';
  }
  progress.value = 0;
  isLoading.value = true; 
});

nuxt.hook("page:finish", () => { 
  hideLoader();
});

// Expose methods to be used by other components via template refs
defineExpose({
  showLoader,
  hideLoader,
  updateProgress,
  registerComponentLoading,
  unregisterComponentLoading
});
</script>

<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-screen" :data-type="loadingType" :data-route="currentRoutePath">
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
    background-color: rgba(0, 0, 0, 0.25);
  }
  
  &-content {
    @apply flex flex-col items-center;
    gap: 1.5rem;
  }
  
  &-text {
    @apply text-white text-xl font-medium lowercase tracking-tighter;
  }
  
  &-spinner {
    @apply w-16 h-16;
  }
  
  &-details {
    @apply mt-2;
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