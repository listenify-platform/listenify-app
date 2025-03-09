import { Sprites, Vector2 } from '@/custom';

export class Sprite {
  public image: HTMLImageElement = new Image();

  public scale: number = 1;
  public width: number = 0;
  public height: number = 0;
  public opacity: number = 1;

  public frames: Sprites.Frames;
  public sprites: Sprites.Images = {};
  public animate: boolean = true;
  public position: Vector2 = new Vector2(0, 0);
  
  // Animation properties
  public blinkFrame: number = 0;
  public freezeFrame: number = 0;
  public animationType: Sprites.AnimationType = Sprites.AnimationType.IDLE;
  public customFrameHandler: ((frame: number) => number) | null = null;
  public freezeBeforeTimeout: boolean = false;
  
  private ready: boolean = false;
  private rejectReady!: (error: Error) => void;
  private readyPromise: Promise<Sprite>;
  private resolveReady!: (sprite: Sprite) => void;
  
  private frameWidth: number = 0; // Store the width of a single frame
  private loopTimeout: any;

  constructor(data: Sprites.Options) {
    // Create a promise that will resolve when the sprite is ready
    this.readyPromise = new Promise<Sprite>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    
    // Set default frames structure
    this.frames = {
      max: 0,      // Will be set automatically after image loads
      end: 0,      // Will be set automatically after image loads
      start: 0,
      hold: 5,
      loop: true,
      val: 0,
      elapsed: 0
    };
    
    // Ensure data.image exists and has a src property
    if (!data.image) {
      console.error('No image provided for sprite');
      // Create a default image to prevent errors
      this.image = new Image();
      this.rejectReady(new Error('No image provided for sprite'));
    } else if (data.image instanceof HTMLImageElement) {
      this.image = data.image;
    } else if (typeof data.image === 'string') {
      // Handle case where a string URL is passed instead of an Image
      this.image = new Image();
      this.image.src = data.image;
    } else {
      console.error('Invalid image type provided for sprite');
      this.image = new Image();
      this.rejectReady(new Error('Invalid image type provided for sprite'));
    }
  
    this.scale = data.scale || 1;
    this.opacity = data.opacity || 1;
    this.animate = data.animate === undefined ? true : data.animate;
    this.sprites = data.sprites || {};
    this.position = data.position || new Vector2(0, 0);
    
    // Determine animation type from image path if available
    this.determineAnimationType();
    
    // Use provided animation type if specified
    if (data.animationType) {
      this.animationType = data.animationType;
    }
    
    // Animation setup
    this.blinkFrame = data.blinkFrame !== undefined ? data.blinkFrame : Math.floor(Math.random() * 20);
    this.customFrameHandler = data.customFrameHandler || null;
  
    // Only set up onload if the image has a source
    if (this.image.src) {
      if (this.image.complete) {
        // Image is already loaded
        this.handleImageLoad();
      } else {
        this.image.onload = () => this.handleImageLoad();
        this.image.onerror = (err) => {
          console.error('Error loading sprite image:', err);
          this.rejectReady(new Error('Failed to load sprite image'));
        };
      }
    } else {
      console.warn('Sprite created with no image source');
      this.rejectReady(new Error('Sprite created with no image source'));
    }
  }
  
  private determineAnimationType(): void {
    const src = this.image.src.toLowerCase();
    
    if (src.includes('dj')) {
      this.animationType = Sprites.AnimationType.DJ;
    } else if (src.includes('b')) {
      this.animationType = Sprites.AnimationType.DANCE;
    } else {
      this.animationType = Sprites.AnimationType.BLINK;
    }
  }
  
  private handleImageLoad(): void {
    // Auto-detect frame count based on image path and dimensions
    this.autoDetectFrames();
    
    // Calculate the width of a single frame correctly
    this.frameWidth = this.image.width / this.frames.max;

    // Set the overall dimensions for the sprite
    this.width = this.frameWidth * this.scale;
    this.height = this.image.height * this.scale;
    
    // Store the freeze frame - default to the first frame
    this.freezeFrame = 0;
    
    // Configure initial frame based on animation type
    this.configureInitialFrame();
    
    // Mark as ready and resolve the promise
    this.ready = true;
    this.resolveReady(this);
  }
  
  private autoDetectFrames(): void {
    let framesMax = 20; // Default frame count
    
    // Detect frame count based on image path pattern
    const src = this.image.src.toLowerCase();
    if (src.includes('dj')) {
      framesMax = 20;
    } else if (src.includes('b')) {
      framesMax = 24;
    } else {
      // Auto-detect frames by image width relative to height
      // Assume square frames if no specific pattern is matched
      const aspectRatio = this.image.width / this.image.height;
      if (aspectRatio > 10) {
        // Very wide image likely has many frames
        framesMax = Math.round(aspectRatio);
      } else if (aspectRatio > 4) {
        // Moderately wide image
        framesMax = Math.round(aspectRatio);
      } else if (aspectRatio > 1) {
        // Slightly wide image
        framesMax = Math.round(aspectRatio * 2) / 2; // Round to nearest 0.5
      } else {
        // Square or tall image - probably just one frame
        framesMax = 1;
      }
    }
    
    // Update frames object with detected values
    this.frames.max = framesMax;
    this.frames.end = framesMax - 1;
  }
  
  private configureInitialFrame(): void {
    switch (this.animationType) {
      case Sprites.AnimationType.DJ:
        this.frames.start = 0;
        this.frames.val = 0;
        break;
      case Sprites.AnimationType.DANCE:
        this.frames.start = 4;
        this.frames.val = 4;
        break;
      case Sprites.AnimationType.BLINK:
        this.frames.start = 0;
        this.frames.val = 0;
        break;
      case Sprites.AnimationType.IDLE:
        this.frames.start = 0;
        this.frames.val = 0;
        break;
      default:
        this.frames.start = 0;
        this.frames.val = 0;
    }
  }
  
  // Returns true if the sprite is ready to be drawn
  public isReady(): boolean {
    return this.ready;
  }
  
  // Returns a promise that resolves when the sprite is ready
  public whenReady(): Promise<Sprite> {
    return this.readyPromise;
  }

  // Set the animation type for this sprite
  public setAnimationType(type: Sprites.AnimationType): void {
    this.animationType = type;
    
    // Reset frame if needed based on animation type
    if (type === Sprites.AnimationType.IDLE || type === Sprites.AnimationType.BLINK) {
      this.frames.val = 0;
      this.regenerateBlinkFrame();
    } else if (type === Sprites.AnimationType.DANCE) {
      this.frames.val = 4; 
    } else if (type === Sprites.AnimationType.DJ) {
      this.frames.val = 0;
    }
  }

  // Set a custom frame handler function
  public setCustomFrameHandler(handler: (frame: number) => number): void {
    this.customFrameHandler = handler;
    this.animationType = Sprites.AnimationType.CUSTOM;
  }

  // Generate a new random blink frame
  public regenerateBlinkFrame(): void {
    this.blinkFrame = Math.floor(Math.random() * 20);
  }

  // Update the sprite's frame based on animation type and current frame
  public updateFrame(currentFrame: number): void {
    if (!this.animate) return;
    
    switch (this.animationType) {
      case Sprites.AnimationType.IDLE:
        // Just show the base idle frame
        this.frames.val = 0;
        break;
        
      case Sprites.AnimationType.BLINK:
        // Occasional blink animation
        if (currentFrame >= this.blinkFrame && currentFrame <= this.blinkFrame + 2) {
          this.frames.val = 1 + (currentFrame - this.blinkFrame);
        } else {
          this.frames.val = 0;
        }
        
        // Regenerate blink frame at the end of animation cycle
        if (currentFrame === 19) this.regenerateBlinkFrame();
        break;
        
      case Sprites.AnimationType.DANCE:
        // Dance animation (frames 4-7)
        this.frames.val = 4 + (currentFrame % this.frames.max);
        break;
        
      case Sprites.AnimationType.DJ:
        // DJ animation (frames 0-19)
        this.frames.val = currentFrame % this.frames.max;
        break;
        
      case Sprites.AnimationType.CUSTOM:
        // Use custom handler if available
        if (this.customFrameHandler) {
          this.frames.val = this.customFrameHandler(currentFrame);
        }
        break;
    }
  }

  public draw(context: CanvasRenderingContext2D, currentFrame?: number): void {
    if (!this.ready || !this.image.complete || this.frameWidth === 0) return; // Don't draw until sprite is ready
    
    // Update animation frame if a current frame was provided
    if (currentFrame !== undefined) {
      this.updateFrame(currentFrame);
    }
    
    // Make sure the frame value is within bounds
    const frameValue = Math.min(Math.max(this.frames.val || 0, 0), this.frames.max - 1);
    
    // Calculate the x position in the sprite sheet for the current frame
    const cropPositionX = frameValue * this.frameWidth;

    context.save();
    context.globalAlpha = this.opacity;

    // Draw the current frame from the sprite sheet
    context.drawImage(
      this.image,
      cropPositionX,         // Source X (which frame to select)
      0,                     // Source Y
      this.frameWidth,       // Source width (width of one frame)
      this.image.height,     // Source height
      
      // Destination calculations - center the sprite horizontally relative to position
      this.position.x - (this.width / 2),
      // Position Y calculation that aligns the bottom of the sprite with the position Y
      this.position.y - this.height,
      
      this.width,            // Destination width (scaled)
      this.height            // Destination height (scaled)
    );

    context.restore();
  }

  public setImage(image: HTMLImageElement): void {
    this.image = image;
    this.ready = false; // Reset ready state
    
    // Create a new ready promise
    this.readyPromise = new Promise<Sprite>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    
    // Re-determine animation type based on new image
    this.determineAnimationType();
    
    if (image.complete) {
      // Image is already loaded
      this.handleImageLoad();
    } else {
      image.onload = () => this.handleImageLoad();
      image.onerror = (err) => {
        console.error('Error loading new sprite image:', err);
        this.rejectReady(new Error('Failed to load new sprite image'));
      };
    }
  }

  // Set a timeout to loop the animation after the specified delay
  public setLoopTimeout(delay: number): void {
    if (delay <= 0) {
      // If no delay, just loop immediately
      this.frames.val = this.frames.start;
      return;
    }
    
    // Enable the freeze state and set the frame to the freeze frame
    this.freezeBeforeTimeout = true;
    
    // Set the timeout to resume animation after the delay
    this.loopTimeout = setTimeout(() => {
      this.frames.val = this.frames.start; // Reset to start frame
      this.freezeBeforeTimeout = false; // Disable the freeze
      this.loopTimeout = null;
    }, delay);
  }

  // Clear the loop timeout to prevent looping after the animation ends
  public clearLoopTimeout(): void {
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
      this.freezeBeforeTimeout = false; // Make sure to disable the freeze
    }
  }
}