<style lang="scss" scoped module>
.player-bar {
  @apply fixed bottom-0 left-0 right-0;
  @apply h-16 bg-gray-900 border-t border-gray-800 flex items-center px-4 z-20;
  @apply pl-4;

  .player-bar-left {
    @apply flex items-center gap-3 w-1/4;
    
    .album-art {
      @apply w-10 h-10 bg-gray-700 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center;
      
      .icon {
        @apply text-gray-400;
      }
    }
    
    .playlist-info {
      @apply min-w-0;
      
      .playlist-name {
        @apply text-white font-medium text-sm truncate;
      }
      
      .playlist-status {
        @apply text-gray-400 text-xs;
      }
    }
  }
  
  .player-bar-center {
    @apply flex-1 flex flex-col items-center justify-center;
    
    .now-playing {
      @apply flex items-center gap-4;
      
      .artist {
        @apply text-white flex items-center gap-2;
        
        .artist-name {
          @apply text-sm;
        }
      }
      
      .playing-status {
        @apply text-white text-sm;
      }
      
      .song-title {
        @apply text-white text-sm font-medium;
      }
    }
    
    .progress-container {
      @apply w-full flex items-center gap-2 mt-1;
      
      .progress-bar {
        @apply w-full h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer;
        
        .progress {
          @apply h-full bg-blue-500 transition-all duration-300 ease-out;
        }
      }
      
      .time-remaining {
        @apply text-gray-400 text-xs;
      }
    }
  }
  
  .player-bar-right {
    @apply w-1/4 flex justify-end items-center gap-4;
    
    .control-button {
      @apply text-white hover:text-blue-400 transition-colors;
    }
    
    .volume-bar {
      @apply w-20 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer;
      
      .volume-level {
        @apply h-full bg-gray-400 transition-all duration-150;
      }
    }
  }
}

@media (max-width: 768px) {
  .player-bar {
    .player-bar-center {
      .now-playing {
        @apply flex-wrap justify-center;
      }
    }
    
    .player-bar-right {
      @apply w-auto;
    }
  }
}
</style>

<script setup lang="ts">
const playerBar = useTemplateRef('playerBar');
const playerStore = usePlayerStore();

// Handle volume bar click
const handleVolumeClick = (event: MouseEvent) => {
  const volumeBar = event.currentTarget as HTMLElement;
  const rect = volumeBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = (clickX / rect.width) * 100;
  playerStore.setVolume(Math.min(100, Math.max(0, percentage)));
};

// Update the player bar height in the store when mounted
onMounted(() => {
  if (playerBar.value) {
    const actualHeight = playerBar.value.getBoundingClientRect().height;

    playerStore.updateBarHeight(actualHeight);
  }
});
</script>

<template>
  <div ref="playerBar" :class="$style['player-bar']" v-if="playerStore.isVisible">
    <!-- Left section - Playlist info -->
    <div :class="$style['player-bar-left']">
      <div :class="$style['album-art']">
        <FontAwesomeIcon icon="fa-solid fa-music" :class="$style.icon" />
      </div>
      <div :class="$style['playlist-info']">
        <div :class="$style['playlist-name']" v-text="playerStore.currentTrack.playlist.name"></div>
        <div :class="$style['playlist-status']">Add a song to play</div>
      </div>
    </div>

    <!-- Center section - Now playing -->
    <div :class="$style['player-bar-center']">
      <div :class="$style['now-playing']" v-if="playerStore.currentTrack.isPlaying">
        <div :class="$style.artist">
          <span :class="$style['artist-name']" v-text="playerStore.currentTrack.artist || 'norelock'"></span>
        </div>
        <div :class="$style['playing-status']">is playing</div>
        <div :class="$style['song-title']" v-text="playerStore.currentTrack.title || 'Queen - I Want To Break Free (Official video)'"></div>
      </div>
      <div :class="$style['progress-container']" v-if="playerStore.currentTrack.isPlaying">
        <div :class="$style['progress-bar']">
          <div :class="$style.progress" :style="{ width: `${playerStore.progressPercentage}%` }"></div>
        </div>
        <span :class="$style['time-remaining']" v-text="playerStore.formattedProgress"></span>
      </div>
    </div>

    <!-- Right section - Controls -->
    <div :class="$style['player-bar-right']">
      <button :class="$style['control-button']" @click="playerStore.toggleMute">
        <FontAwesomeIcon :icon="playerStore.isMuted ? 'fa-solid fa-volume-mute' : 'fa-solid fa-volume-up'" />
      </button>
      <div :class="$style['volume-bar']" @click="handleVolumeClick">
        <div :class="$style['volume-level']" :style="{ width: `${playerStore.volume}%` }"></div>
      </div>
    </div>
  </div>
</template>