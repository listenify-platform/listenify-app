export const usePlayerStore = defineStore('player', () => {
  // Player visibility state
  const isVisible = ref(true);
  
  // Player bar height (in pixels)
  const barHeight = ref(64); // 4rem = 64px default
  
  // Current track information
  const currentTrack = ref({
    id: '',
    title: '',
    artist: '',
    duration: 0,
    progress: 0,
    isPlaying: false,
    playlist: {
      id: '',
      name: 'My first playlist'
    }
  });
  
  // Playback state
  const volume = ref(80); // 0-100
  const isMuted = ref(false);
  
  // Computed properties
  const formattedProgress = computed(() => {
    if (!currentTrack.value.duration) return '-0:00';
    const remainingSeconds = currentTrack.value.duration - currentTrack.value.progress;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
    return `-${minutes}:${seconds.toString().padStart(2, '0')}`;
  });
  
  const progressPercentage = computed(() => {
    if (!currentTrack.value.duration) return 0;
    return (currentTrack.value.progress / currentTrack.value.duration) * 100;
  });
  
  // Actions
  function showPlayer() {
    isVisible.value = true;
  }
  
  function hidePlayer() {
    isVisible.value = false;
  }
  
  function togglePlayerVisibility() {
    isVisible.value = !isVisible.value;
  }
  
  function updateBarHeight(height: number) {
    barHeight.value = height;
  }
  
  function setVolume(newVolume: number) {
    volume.value = Math.max(0, Math.min(100, newVolume));
  }
  
  function toggleMute() {
    isMuted.value = !isMuted.value;
  }
  
  function playTrack(track: any) {
    currentTrack.value = {
      ...track,
      isPlaying: true,
      progress: 0
    };
  }
  
  function togglePlayPause() {
    if (currentTrack.value.id) {
      currentTrack.value.isPlaying = !currentTrack.value.isPlaying;
    }
  }
  
  function updateProgress(progress: number) {
    if (currentTrack.value.id) {
      currentTrack.value.progress = progress;
    }
  }
  
  return {
    // State
    isVisible,
    barHeight,
    currentTrack,
    volume,
    isMuted,
    
    // Computed
    formattedProgress,
    progressPercentage,
    
    // Actions
    showPlayer,
    hidePlayer,
    togglePlayerVisibility,
    updateBarHeight,
    setVolume,
    toggleMute,
    playTrack,
    togglePlayPause,
    updateProgress
  };
});