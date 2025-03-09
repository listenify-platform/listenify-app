<template>
  <div :class="$style['audience-view']">
    <canvas ref="audienceCanvas" width="805" height="207"></canvas>
    <div v-if="loading" :class="$style['loading-overlay']">
      <div :class="$style.spinner"></div>
    </div>
    <div :class="$style['debug-overlay']" v-if="showDebug && !loading">
      <div>Avatars: {{ users.size }}</div>
      <div>Loaded: {{ loadedAvatars }}/{{ totalAvatars }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped module>
.audience-view {
  @apply absolute bottom-0 mb-40 z-10;

  width: 100%;

  canvas {
    @apply block w-full;
    height: 207px;
  }

  .debug-overlay {
    @apply absolute top-2 left-2 border border-gray-700 bg-black bg-opacity-70 text-white p-2 font-mono text-sm;
    max-width: 300px;
  }

  .loading-overlay {
    @apply absolute inset-0 flex flex-col items-center justify-center;

    .spinner {
      @apply w-10 h-10 border-4 border-t-blue-500 rounded-full animate-spin mb-4;
      border-top-color: #3498db;
    }
  }
}
</style>

<script lang="ts" setup>
import {
  type Users,
  Sprite,
  Sprites,
  Vector2,
  gridData,
  findAvatar,
  loadAvatar,
  initializeAvatars,
  getAllVariantsForCharacter
} from '@/custom';

// Constants
let WIDTH = 805;
const HEIGHT = 207;
const OFFSET_X = 15;
const OFFSET_Y = 50;
const BASE_WIDTH = 805;       // Base width that corresponds to GRID_BASE_COLUMNS
const FRAME_INTERVAL = 100; // ms between frames
const GRID_MIN_COLUMNS = 150; // Minimum number of grid columns
const GRID_MAX_COLUMNS = 250; // Maximum number of grid columns
const GRID_BASE_COLUMNS = 196; // Base/default number of columns

// Props
const props = defineProps({
  currentUser: {
    type: Object,
    default: {} as Users.Public
  },
  showDebug: {
    type: Boolean,
    default: true
  },
  enableAnimation: {
    type: Boolean,
    default: true
  },
  usersData: {
    type: Array,
    default: () => [] as Users.Public[]
  }
});

// Emits
const emit = defineEmits(['userClicked', 'ready', 'audienceFull']);

// DOM refs
const loading = ref(true);
const audienceCanvas = ref<HTMLCanvasElement | null>(null);

// State
const frame = ref(0);
const users = reactive(new Map());
const colorMap = ref<Record<string, any[]>>({});
const userCount = ref(0);
const isAnimating = ref(props.enableAnimation);
const visibleRows = ref(3); // Number of rows to immediately load avatars for
const totalAvatars = ref(0);
const loadedAvatars = ref(0);
const importedAvatarSprites = reactive(new Map());
const placeholderAnimationId = ref<number | null>(null);

// Animation state
let intervalId: number | null = null;
let animationFrameId: number | null = null;
let canvasResizeObserver: ResizeObserver | null = null;

// Placeholder canvas for generating placeholder images
const placeholderCanvas = document.createElement('canvas');
placeholderCanvas.width = 120;
placeholderCanvas.height = 120;
const placeholderCtx = placeholderCanvas.getContext('2d');

// Function to create and draw a blue polygon placeholder with rotating loading circle
function createLoadingPlaceholder(): HTMLImageElement {
  if (!placeholderCtx) return new Image();
  
  const width = placeholderCanvas.width;
  const height = placeholderCanvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Clear canvas
  placeholderCtx.clearRect(0, 0, width, height);
  
  // Draw blue polygon background
  placeholderCtx.fillStyle = '#1E3A8A'; // Deep blue color
  placeholderCtx.beginPath();
  
  // Create hexagon shape
  const size = Math.min(width, height) * 0.4;
  const sides = 6;
  
  placeholderCtx.moveTo(centerX + size * Math.cos(0), centerY + size * Math.sin(0));
  
  for (let i = 1; i <= sides; i++) {
    const angle = i * 2 * Math.PI / sides;
    placeholderCtx.lineTo(centerX + size * Math.cos(angle), centerY + size * Math.sin(angle));
  }
  
  placeholderCtx.closePath();
  placeholderCtx.fill();
  
  // Draw a loading circle with animation based on current time
  const loadingAngle = Date.now() / 500 % (Math.PI * 2); // Rotate based on time
  
  placeholderCtx.strokeStyle = '#FFF'; // White for the loading circle
  placeholderCtx.lineWidth = 4;
  placeholderCtx.beginPath();
  placeholderCtx.arc(
    centerX, 
    centerY, 
    size * 0.8, 
    loadingAngle, 
    loadingAngle + Math.PI * 1.2
  );
  placeholderCtx.stroke();
  
  // Create an image from the canvas
  const img = new Image();
  img.src = placeholderCanvas.toDataURL('image/png');
  return img;
}

// Start placeholder animation loop
function startPlaceholderAnimation() {
  if (placeholderAnimationId.value !== null) return;
  
  const animate = () => {
    // Update all placeholder images
    for (const [userId, user] of users.entries()) {
      if (!user._avatarLoaded && importedAvatarSprites.has(userId)) {
        const sprite = importedAvatarSprites.get(userId);
        if (sprite) {
          // Create a new placeholder with the current animation frame
          const placeholder = createLoadingPlaceholder();
          // Update the sprite's image
          sprite.setImage(placeholder);
        }
      }
    }
    
    // Continue the animation loop
    placeholderAnimationId.value = requestAnimationFrame(animate);
  };
  
  placeholderAnimationId.value = requestAnimationFrame(animate);
}

// Stop placeholder animation
function stopPlaceholderAnimation() {
  if (placeholderAnimationId.value !== null) {
    cancelAnimationFrame(placeholderAnimationId.value);
    placeholderAnimationId.value = null;
  }
}

// Initialize the audience view
onMounted(async () => {
  await nextTick();

  // Initialize audience canvas
  if (audienceCanvas.value) {
    // Set up canvas for handling user interaction
    audienceCanvas.value.addEventListener('click', handleCanvasClick);
    audienceCanvas.value.addEventListener('mousemove', handleCanvasHover);
  }

  // Setup resize handling
  setupResizeListener();

  // Only initialize the avatar manifest without loading actual images
  await initializeAvatars();

  // Clear the grid
  clearAudience();

  // Add initial users
  if (props.usersData && props.usersData.length > 0) {
    for (const userData of props.usersData) {
      addUser(userData as Users.Public);
    }
  }

  // Add current user if provided
  if (props.currentUser?.id) {
    addUser(props.currentUser as Users.Public);
  }
  
  // Start placeholder animation
  startPlaceholderAnimation();

  // Start animation if enabled
  if (isAnimating.value) {
    startAnimation();
  }

  loading.value = false;

  // Emit ready event
  emit('ready', { userCount: userCount.value });
  
  // Start loading avatars for visible rows
  loadVisibleAvatars();
});

// Load avatars for visible rows
function loadVisibleAvatars() {
  // Count total avatars
  totalAvatars.value = users.size;
  
  // Load avatars for users in the first few rows and the current user
  for (const [userId, user] of users.entries()) {
    if (user.isCurrentUser || (user._position && user._position.r < visibleRows.value)) {
      loadAvatarForUser(userId);
    }
  }
}

// Clean up on unmount
onUnmounted(() => {
  stopAnimation();
  stopPlaceholderAnimation();

  // Remove event listeners
  if (audienceCanvas.value) {
    audienceCanvas.value.removeEventListener('click', handleCanvasClick);
    audienceCanvas.value.removeEventListener('mousemove', handleCanvasHover);
  }

  // Clean up resize handling
  if (canvasResizeObserver) {
    canvasResizeObserver.disconnect();
  }
  window.removeEventListener('resize', handleCanvasResize);
});

// Set up resize listener
function setupResizeListener() {
  // Handle initial resize
  handleCanvasResize();

  // Add window resize listener with debounce
  window.addEventListener('resize', handleCanvasResize);

  // Use ResizeObserver for more accurate container size changes
  if (typeof ResizeObserver !== 'undefined') {
    const containerElement = audienceCanvas.value?.parentElement;
    if (containerElement) {
      const resizeObserver = new ResizeObserver(handleCanvasResize);
      resizeObserver.observe(containerElement);

      // Store observer for cleanup
      canvasResizeObserver = resizeObserver;
    }
  }
}

// Handle canvas resize
// Updated handleCanvasResize function with grid size limits
function handleCanvasResize(): void {
  if (!audienceCanvas.value) return;

  // Store old width for scaling calculations
  const oldWidth = WIDTH;

  // Get the container width
  const containerWidth = audienceCanvas.value.parentElement?.clientWidth || oldWidth;

  // if width hasn't really changed
  if (Math.abs(containerWidth - oldWidth) < 5)
    return;

  // Update canvas width attribute to match container
  audienceCanvas.value.width = containerWidth;
  WIDTH = containerWidth;

  // Keep height fixed at 207px
  audienceCanvas.value.height = HEIGHT;

  // Calculate proportional grid columns based on width ratio
  let widthRatio = WIDTH / BASE_WIDTH;
  let newColumns = Math.floor(GRID_BASE_COLUMNS * widthRatio);

  // Apply grid size limits
  newColumns = Math.max(GRID_MIN_COLUMNS, Math.min(GRID_MAX_COLUMNS, newColumns));

  // Only resize the grid if the column count has changed significantly
  if (Math.abs(newColumns - gridData.columns) > 5)
    gridData.resize(newColumns);

  // Force immediate update of all sprite positions
  updateAllSpritePositions();

  // Force redraw
  const ctx = audienceCanvas.value.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    draw();
  }
}

// New function to update all sprite positions after resize
function updateAllSpritePositions(): void {
  for (const [userId, sprite] of importedAvatarSprites.entries()) {
    const user = users.get(userId);
    if (!user || !user._position) continue;

    // Calculate new position based on updated grid position
    const newPosition = calculatePositionFromGrid(user._position);

    // Update sprite position directly with the new position
    sprite.position = new Vector2(newPosition.x, newPosition.y);
    sprite.scale = newPosition.scale;

    // Update sprite dimensions
    if (sprite.image?.width) {
      const frameWidth = sprite.image.width / sprite.frames.max;
      sprite.width = frameWidth * sprite.scale;
      sprite.height = sprite.image.height * sprite.scale;
    }

    // Update hit detection rectangles using updateHitRectangle
    updateHitRectangle(userId);
  }
}

// Function to update hit rectangle for a specific user
function updateHitRectangle(userId: string): void {
  const user = users.get(userId);
  if (!user || !user._position) return;
  
  const sprite = importedAvatarSprites.get(userId);
  if (!sprite) return;
  
  // Calculate position
  const position = calculatePositionFromGrid(user._position);
  
  // Create slightly larger hit area for better user experience
  const hitWidth = sprite.width ? sprite.width + 20 : 80; // Default width if not yet set
  const hitHeight = sprite.height ? sprite.height + 20 : 140; // Default height if not yet set
  
  // Create a new hit rectangle with appropriate dimensions
  const hitRect = {
    left: position.x - hitWidth/3,
    top: position.y - hitHeight / 1.45,
    right: position.x + hitWidth/3,
    bottom: position.y
  };
  
  // Find and update in colorMap
  const avatarId = user._avatarId || 'base01';
  const colorIndex = avatarId.charCodeAt(0) % 255;
  
  if (colorMap.value[colorIndex]) {
    for (let i = 0; i < colorMap.value[colorIndex].length; i++) {
      if (colorMap.value[colorIndex][i].user.id === userId) {
        colorMap.value[colorIndex][i].rect = hitRect;
        break;
      }
    }
  }
}

// Watch for props changes
watch(() => props.enableAnimation, (newValue) => {
  isAnimating.value = newValue;
  if (newValue) {
    startAnimation();
  } else {
    stopAnimation();
  }
});

// Add a user to the audience
function addUser(userData: Users.Public): boolean {
  // Skip if user already exists
  if (users.has(userData.id)) {
    return false;
  }

  // Prep user data for grid
  const user = {
    id: userData.id,
    isCurrentUser: userData.id === props.currentUser?.id,
    avatarConfig: userData.avatarConfig,
    username: userData.username,
    priority: 0,
    _avatarLoaded: false,
    _variantsLoaded: false
  };

  // Add user to grid
  const result = gridData.addUser(user);

  // If added successfully, create the avatar sprite
  if (result === true) {
    createUserSprite(user);
    userCount.value++;
    return true;
  } else if (result === false) {
    // Grid is full
    emit('audienceFull');
    return false;
  }

  return false;
}

// Create a sprite for a user with placeholder
async function createUserSprite(user: any): Promise<void> {
  // Avatar name from avatarConfig
  const avatarName = user.avatarConfig?.collection || 'base';
  const avatarNumber = user.avatarConfig?.number || 1;
  const avatarId = avatarName + avatarNumber.toString().padStart(2, '0');

  // Store avatar ID for later
  user._avatarId = avatarId;
  
  // Create a placeholder image
  const placeholderImg = createLoadingPlaceholder();
  
  // Calculate position based on grid
  const position = calculatePositionFromGrid(user._position);

  // Create sprite with placeholder image
  const sprite = new Sprite({
    image: placeholderImg,
    position: new Vector2(position.x, position.y),
    scale: position.scale,
    opacity: 1,
    animate: false, // Don't animate placeholder
    sprites: {}
  });

  // Store in sprite map
  importedAvatarSprites.set(user.id, sprite);
  users.set(user.id, user);

  // Create default dimensions for hit detection
  const defaultWidth = 80 * position.scale;
  const defaultHeight = 140 * position.scale;

  // Add to color map for hit detection
  const colorIndex = avatarId.charCodeAt(0) % 255;
  if (!colorMap.value[colorIndex]) {
    colorMap.value[colorIndex] = [];
  }

  colorMap.value[colorIndex].push({
    sprite,
    user,
    rect: {
      left: position.x - defaultWidth / 2,
      top: position.y - defaultHeight,
      right: position.x + defaultWidth / 2,
      bottom: position.y
    }
  });
  
  // Make sure the placeholder animation is running
  if (placeholderAnimationId.value === null) {
    startPlaceholderAnimation();
  }
}

// Load avatar for a specific user
async function loadAvatarForUser(userId: string): Promise<void> {
  const user = users.get(userId);
  if (!user || user._avatarLoaded || user._avatarLoading) return;
  
  try {
    // Mark as loading to prevent duplicate loads
    user._avatarLoading = true;
    
    // Get the avatar ID
    const avatarId = user._avatarId;
    if (!avatarId) {
      console.error(`No avatar ID for user ${userId}`);
      user._avatarLoading = false;
      return;
    }
    
    // Actually load the avatar
    const loadedAvatar = await loadAvatar(avatarId);
    
    if (!loadedAvatar) {
      console.error(`Failed to load avatar ${avatarId} for user ${userId}`);
      user._avatarLoading = false;
      return;
    }
    
    // Get the sprite
    const sprite = importedAvatarSprites.get(userId);
    if (!sprite) return;
    
    // Update sprite with real image
    sprite.setImage(loadedAvatar);
    
    // Update hit rectangle after loading
    updateHitRectangle(userId);
    
    // Enable animation
    sprite.animate = true;
    
    // Set animation type
    if (user.isCurrentUser) {
      sprite.setAnimationType(Sprites.AnimationType.BLINK);
    }
    
    // Mark as loaded
    user._avatarLoaded = true;
    loadedAvatars.value++;
    
    // Force redraw
    draw();
    
    // Load variants in background
    loadVariantsForUser(userId, avatarId);
  } catch (error) {
    console.error(`Error loading avatar for user ${userId}:`, error);
    const user = users.get(userId);
    if (user) user._avatarLoading = false;
  }
}

// Load avatar variants for a user
async function loadVariantsForUser(userId: string, avatarId: string): Promise<void> {
  const user = users.get(userId);
  if (!user || user._variantsLoaded || user._variantsLoading) return;
  
  try {
    // Mark as loading to prevent duplicate loads
    user._variantsLoading = true;
    
    // Initialize variants object if needed
    if (!user._variants) user._variants = {};
    
    // Get base avatar metadata
    const baseAvatarMeta = findAvatar(avatarId);
    if (baseAvatarMeta) user._variants.base = baseAvatarMeta;
    
    // Try to load variants
    try {
      const variants = getAllVariantsForCharacter(avatarId);
      for (const variant of variants) {
        if (typeof variant.variant === 'string')
          user._variants[variant.variant] = await loadAvatar(avatarId, variant.variant);
      }
    } catch (err) {
      console.log(`No variants for ${avatarId}`);
    }
    
    // Update sprite variants
    const sprite = importedAvatarSprites.get(userId);
    if (sprite) {
      sprite.sprites = user._variants;
    }
    
    // Mark variants as loaded
    user._variantsLoaded = true;
    user._variantsLoading = false;
  } catch (error) {
    console.error(`Error loading variants for user ${userId}:`, error);
    const user = users.get(userId);
    if (user) user._variantsLoading = false;
  }
}

// Calculate canvas position from grid position
function calculatePositionFromGrid(gridPosition: { r: number, c: number }): { x: number, y: number, scale: number } {
  const row = gridPosition.r;
  const col = gridPosition.c;

  // Apply scaling based on row (further back = smaller)
  const yScaleFactor = (1 - gridData.backScale) / gridData.rows;
  let scale = gridData.backScale;
  let offsetY = OFFSET_Y;

  // Calculate vertical position - this stays the same regardless of width
  for (let i = 0; i < row; i++) {
    scale = yScaleFactor * i + gridData.backScale;
    const cellHeight = gridData.cellSize * scale;
    if (i < row) {
      offsetY += cellHeight;
    }
  }

  // For the current row
  scale = yScaleFactor * row + gridData.backScale;

  // Calculate horizontal position based on current width
  const cellWidth = gridData.cellSize * scale;

  // Calculate available width for the row based on the perspective
  const visibleWidth = gridData.columns * cellWidth;
  const perspectiveOffset = (WIDTH - visibleWidth) / 2;

  // Calculate final x position - precise column positioning
  const x = perspectiveOffset + col * cellWidth + cellWidth / 2;

  return {
    x,
    y: offsetY + cellWidth / 2,
    scale
  };
}

// Remove a user from the audience
function removeUser(userId: string): boolean {
  // Remove from grid
  const removed = gridData.removeUser(userId);

  if (removed) {
    // Get user
    const user = users.get(userId);
    
    // Update avatar count if it was loaded
    if (user && user._avatarLoaded) {
      loadedAvatars.value--;
    }
    
    // Remove sprite
    importedAvatarSprites.delete(userId);
    users.delete(userId);
    userCount.value--;
    totalAvatars.value = users.size;

    // Clean up color map
    for (const key in colorMap.value) colorMap.value[key] = colorMap.value[key].filter(item => item.user.id !== userId);
    
    return true;
  }

  return false;
}

// Clear the whole audience
function clearAudience(): void {
  // Clear grid
  gridData.clear();

  // Clear our trackers
  users.clear();
  importedAvatarSprites.clear();
  userCount.value = 0;
  loadedAvatars.value = 0;
  totalAvatars.value = 0;
  colorMap.value = {};

  // Clear canvas
  const ctx = audienceCanvas.value?.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }
}

// Start animation
function startAnimation(): void {
  if (intervalId !== null) {
    stopAnimation();
  }

  // Start frame timer
  intervalId = window.setInterval(() => {
    frame.value = (frame.value + 1) % 20; // 20 frames in animation cycle
  }, FRAME_INTERVAL);

  // Start render loop
  animationFrameId = requestAnimationFrame(draw);
}

// Stop animation
function stopAnimation(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Draw function - renders all audience members
function draw(): void {
  const ctx = audienceCanvas.value?.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Debug grid
  drawHitAreas(ctx);
  drawDebugGrid(ctx);

  // Sort sprites by y-position (back to front)
  const sortedSprites = Array.from(importedAvatarSprites.entries()).sort((a, b) => {
    const aPos = calculatePositionFromGrid(gridData.userMap[a[0]]._position);
    const bPos = calculatePositionFromGrid(gridData.userMap[b[0]]._position);
    return aPos.y - bPos.y;
  });

  // Draw each sprite
  for (const [userId, sprite] of sortedSprites) {
    // Get user
    const user = users.get(userId);
    if (!user) continue;
    
    // Skip unloaded avatar animations
    if (!user._avatarLoaded) {
      // Draw static placeholder
      sprite.draw(ctx);
      continue;
    }

    // Update animation type if needed
    if (user.isCurrentUser && sprite.animationType !== Sprites.AnimationType.BLINK) {
      sprite.setAnimationType(Sprites.AnimationType.BLINK);
    }

    // Draw the sprite with the current frame counter
    sprite.draw(ctx, frame.value);
  }

  // Continue animation
  if (isAnimating.value) {
    animationFrameId = requestAnimationFrame(draw);
  }
}

// Draw debug hit areas
function drawHitAreas(ctx: CanvasRenderingContext2D): void {
  if (!props.showDebug) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
  ctx.lineWidth = 1;
  
  for (const colorKey in colorMap.value) {
    for (const item of colorMap.value[colorKey]) {
      const { rect } = item;
      
      // Draw hit rectangle
      ctx.strokeRect(
        rect.left, 
        rect.top, 
        rect.right - rect.left, 
        rect.bottom - rect.top
      );
      
      // Draw center point
      ctx.fillStyle = 'red';
      const centerX = (rect.left + rect.right) / 2;
      const centerY = (rect.top + rect.bottom) / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// Draw debug grid
function drawDebugGrid(ctx: CanvasRenderingContext2D): void {
  if (!props.showDebug) return;

  const zoneColors = [
    '#33007F', // Zone 1 (back)
    '#80007F', // Zone 2
    '#990000', // Zone 3
    '#FF0000', // Zone 4 (VIP)
    '#FFFF00', // Zone 5 (current user)
    '#00FF00'  // Zone 6 (special avatars)
  ];

  // Draw grid cells
  for (let row = 0; row < gridData.rows; row++) {
    const yScaleFactor = (1 - gridData.backScale) / gridData.rows;
    const scale = yScaleFactor * row + gridData.backScale;
    const cellHeight = gridData.cellSize * scale;

    let yPos = OFFSET_Y;
    for (let i = 0; i < row; i++) {
      yPos += gridData.cellSize * (yScaleFactor * i + gridData.backScale);
    }

    const perspectiveOffset = (WIDTH - 2 * OFFSET_X - gridData.cellSize * gridData.columns * scale) / 2;

    for (let col = 0; col < gridData.columns; col++) {
      // Get zone for this cell
      const zoneIds = gridData.getZoneIDsForCellAt(row, col);
      if (zoneIds.length === 0) continue;

      // Sort zones (higher number = higher priority)
      zoneIds.sort();
      const zoneId = zoneIds[zoneIds.length - 1];

      // Get priority for this cell
      const priority = gridData.getPriorityLevelForCellAt(row, col) / 100;
      if (priority <= 0) continue;

      // Calculate position
      const x = OFFSET_X + perspectiveOffset + col * cellHeight;

      // Draw cell with zone color and priority-based opacity
      ctx.globalAlpha = priority * 0.3;
      ctx.fillStyle = zoneColors[zoneId - 1] || '#333333';
      ctx.fillRect(x, yPos, cellHeight, cellHeight);
    }
  }

  ctx.globalAlpha = 1.0;
}

// Handle canvas click with proper coordinate calculation
function handleCanvasClick(event: MouseEvent): void {
  // Get canvas rectangle
  const rect = audienceCanvas.value?.getBoundingClientRect();
  if (!rect) return;
  
  // Calculate mouse position relative to the canvas
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const clickedItem = findItemAtPosition(x, y);
  
  if (clickedItem) {
    const user = clickedItem.user;
    
    // If clicking on an unloaded avatar, load it
    if (!user._avatarLoaded && !user._avatarLoading) {
      loadAvatarForUser(user.id);
    }
    
    // Emit click event
    emit('userClicked', user);
  }
}

// FIXED - Handle canvas hover with proper coordinate calculation
function handleCanvasHover(event: MouseEvent): void {
  if (!audienceCanvas.value) return;

  // Get canvas rectangle
  const rect = audienceCanvas.value?.getBoundingClientRect();
  if (!rect) return;
  
  // Calculate mouse position relative to the canvas
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const hoveredItem = findItemAtPosition(x, y);
  
  if (hoveredItem)
    audienceCanvas.value.style.cursor = 'pointer';
  else
    audienceCanvas.value.style.cursor = 'default';
}

// FIXED - Find item at position with improved coordinate scaling
function findItemAtPosition(x: number, y: number): any | null {
  if (!audienceCanvas.value) return null;

  // Scale coordinates based on canvas size
  const canvasWidth = audienceCanvas.value.width;
  const canvasHeight = audienceCanvas.value.height;
  const displayWidth = audienceCanvas.value.clientWidth;
  const displayHeight = audienceCanvas.value.clientHeight;
  
  // Calculate the scaling factors
  const scaleX = canvasWidth / displayWidth;
  const scaleY = canvasHeight / displayHeight;

  // Apply scaling to get the correct canvas coordinates
  const scaledX = x * scaleX;
  const scaledY = y * scaleY;
  
  // Make hit areas slightly bigger for better usability
  const hitAreaExpansion = 5;

  // Check against each user's hit area
  for (const colorKey in colorMap.value) {
    for (const item of colorMap.value[colorKey]) {
      const { rect } = item;
      
      // Expand the hit area slightly for better usability
      const expandedRect = {
        left: rect.left - hitAreaExpansion,
        top: rect.top - hitAreaExpansion,
        right: rect.right + hitAreaExpansion,
        bottom: rect.bottom + hitAreaExpansion
      };
      
      if (
        scaledX >= expandedRect.left &&
        scaledX <= expandedRect.right &&
        scaledY >= expandedRect.top &&
        scaledY <= expandedRect.bottom
      ) {
        return item;
      }
    }
  }

  return null;
}

// Export methods for parent component
defineExpose({
  addUser,
  removeUser,
  clearAudience,
  startAnimation,
  stopAnimation,
  loadAvatarForUser
});
</script>