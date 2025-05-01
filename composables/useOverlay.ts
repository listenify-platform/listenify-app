import { ref, computed, reactive } from 'vue';

interface OverlayState {
  id: string;
  isOpen: boolean;
  zIndex: number;
  data?: any;
}

// Base z-index for overlays
const BASE_Z_INDEX = 50;

// Keep track of all registered overlays
const overlays = reactive<Record<string, OverlayState>>({});

// Track highest z-index to ensure proper stacking
let highestZIndex = BASE_Z_INDEX;

/**
 * Composable for managing overlay states across the application
 * 
 * @returns Methods and state for overlay management
 */
export function useOverlay() {
  /**
   * Register a new overlay
   * @param id Unique identifier for the overlay
   * @returns OverlayState for the registered overlay
   */
  const register = (id: string): OverlayState => {
    if (overlays[id]) {
      return overlays[id];
    }

    overlays[id] = {
      id,
      isOpen: false,
      zIndex: BASE_Z_INDEX,
      data: null
    };

    return overlays[id];
  };

  /**
   * Open an overlay
   * @param id Overlay identifier
   * @param data Optional data to pass to the overlay
   */
  const open = (id: string, data?: any) => {
    // Register the overlay if it doesn't exist
    if (!overlays[id]) {
      register(id);
    }

    // Close other overlays if needed
    // for (const key in overlays) {
    //   if (key !== id && overlays[key].isOpen) {
    //     overlays[key].isOpen = false;
    //   }
    // }

    // Update z-index to be on top
    highestZIndex += 10;
    overlays[id].zIndex = highestZIndex;
    overlays[id].isOpen = true;
    overlays[id].data = data;
  };

  /**
   * Close an overlay
   * @param id Overlay identifier
   */
  const close = (id: string) => {
    if (overlays[id]) {
      overlays[id].isOpen = false;
      // Keep the data until explicitly reset
    }
  };

  /**
   * Close all open overlays
   */
  const closeAll = () => {
    for (const id in overlays) {
      overlays[id].isOpen = false;
    }
  };

  /**
   * Get the state of a specific overlay
   * @param id Overlay identifier
   * @returns OverlayState or undefined if not registered
   */
  const getState = (id: string) => {
    return overlays[id];
  };

  /**
   * Check if an overlay is open
   * @param id Overlay identifier
   * @returns Boolean indicating if overlay is open
   */
  const isOpen = (id: string) => {
    return overlays[id]?.isOpen || false;
  };

  /**
   * Get all currently open overlays
   * @returns Array of open overlay states
   */
  const getOpenOverlays = computed(() => {
    return Object.values(overlays).filter(overlay => overlay.isOpen);
  });

  /**
   * Set data for an overlay
   * @param id Overlay identifier
   * @param data Data to set
   */
  const setData = (id: string, data: any) => {
    if (overlays[id]) {
      overlays[id].data = data;
    }
  };

  /**
   * Get data from an overlay
   * @param id Overlay identifier
   * @returns Data stored in the overlay or undefined
   */
  const getData = (id: string) => {
    return overlays[id]?.data;
  };

  /**
   * Toggle an overlay's visibility
   * @param id Overlay identifier
   * @param data Optional data to pass when opening
   */
  const toggle = (id: string, data?: any) => {
    if (isOpen(id)) {
      close(id);
    } else {
      open(id, data);
    }
  };

  return {
    register,
    open,
    close,
    closeAll,
    getState,
    isOpen,
    getOpenOverlays,
    setData,
    getData,
    toggle
  };
}

// Singleton instance for global use
// This allows the same overlay state to be accessed from any component
export default useOverlay();