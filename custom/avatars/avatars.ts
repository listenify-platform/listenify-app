import { type Sprites } from '@/custom';

const loadAvatarsManifest = async () => {
  console.log('Starting to load avatar manifest...');
  try {
    const module = await import('./manifest');
    console.log('Avatar manifest loaded successfully:', Object.keys(module.avatars).length, 'avatars found');
    return module.avatars;
  } catch (error) {
    console.error('Failed to load avatar manifest:', error);
    throw error; // Re-throw to propagate the error
  }
};

export class Avatar extends Image {
  public variant: string | null = null;
  public fullName: string = '';
  public isLoaded: boolean = false;
  public isLoading: boolean = false;
  public sourceUrl: string = '';
  public baseCharacterName: string = '';

  // Placeholder polygon properties
  private _placeholderCanvas: HTMLCanvasElement | null = null;
  private _placeholderCtx: CanvasRenderingContext2D | null = null;
  private _spinnerAngle: number = 0;
  private _spinnerAnimationId: number | null = null;

  private rejectLoad!: (error: Error) => void;
  private loadPromise: Promise<Avatar>;
  private resolveLoad!: (avatar: Avatar) => void;

  constructor(data: {
    baseCharacterName: string,
    variant: string | null,
    fullName: string,
    sourceUrl: string
  }) {
    super();
    this.baseCharacterName = data.baseCharacterName;
    this.variant = data.variant;
    this.fullName = data.fullName;
    this.sourceUrl = data.sourceUrl;

    // Create a promise that will resolve when the image is loaded
    this.loadPromise = new Promise<Avatar>((resolve, reject) => {
      this.rejectLoad = reject;
      this.resolveLoad = resolve;
    });

    // Set up load and error handlers
    this.onload = () => {
      this.isLoaded = true;
      this.isLoading = false;
      this.stopPlaceholderAnimation();
      this.resolveLoad(this);
    };

    this.onerror = (err) => {
      this.isLoading = false;
      this.stopPlaceholderAnimation();
      console.error(`Error loading avatar: ${this.fullName}`, err);
      this.rejectLoad(new Error(`Failed to load avatar: ${this.fullName}`));
    };

    // Initialize placeholder
    this.initPlaceholder();
  }

  // Initialize the placeholder canvas
  private initPlaceholder(): void {
    this._placeholderCanvas = document.createElement('canvas');
    this._placeholderCanvas.width = 120;  // Default width for placeholder
    this._placeholderCanvas.height = 120; // Default height for placeholder
    this._placeholderCtx = this._placeholderCanvas.getContext('2d');

    // Draw initial placeholder
    this.drawPlaceholder();
  }

  // Draw the placeholder polygon with loading spinner
  private drawPlaceholder(): void {
    if (!this._placeholderCtx) return;

    const ctx = this._placeholderCtx;
    const width = this._placeholderCanvas!.width;
    const height = this._placeholderCanvas!.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw polygon background
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();

    // Create hexagon shape
    const size = Math.min(width, height) * 0.4;
    const sides = 6;
    ctx.moveTo(centerX + size * Math.cos(0), centerY + size * Math.sin(0));

    for (let i = 1; i <= sides; i++) {
      const angle = i * 2 * Math.PI / sides;
      ctx.lineTo(centerX + size * Math.cos(angle), centerY + size * Math.sin(angle));
    }

    ctx.closePath();
    ctx.fill();

    // Draw loading spinner if loading
    if (this.isLoading) {
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        size * 0.8,
        this._spinnerAngle,
        this._spinnerAngle + 1.5
      );
      ctx.stroke();

      // Draw initial letter of avatar in center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = this.baseCharacterName.charAt(0).toUpperCase();
      ctx.fillText(initial, centerX, centerY);
    } else {
      // Show loading text when not started yet
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initial = this.baseCharacterName.charAt(0).toUpperCase();
      ctx.fillText(initial, centerX, centerY - 10);
      ctx.font = '10px Arial';
      ctx.fillText('Click to load', centerX, centerY + 15);
    }
  }

  // Start placeholder spinner animation
  private startPlaceholderAnimation(): void {
    if (this._spinnerAnimationId) return;

    const animate = () => {
      this._spinnerAngle = (this._spinnerAngle + 0.1) % (2 * Math.PI);
      this.drawPlaceholder();
      this._spinnerAnimationId = requestAnimationFrame(animate);
    };

    this._spinnerAnimationId = requestAnimationFrame(animate);
  }

  // Stop placeholder animation
  private stopPlaceholderAnimation(): void {
    if (this._spinnerAnimationId) {
      cancelAnimationFrame(this._spinnerAnimationId);
      this._spinnerAnimationId = null;
    }
  }

  // Get placeholder as image data URL
  public getPlaceholderDataURL(): string {
    if (!this._placeholderCanvas) return '';
    this.drawPlaceholder(); // Ensure it's up to date
    return this._placeholderCanvas.toDataURL('image/png');
  }

  // Load the actual avatar image
  public load(): Promise<Avatar> {
    if (this.isLoaded) {
      return Promise.resolve(this);
    }

    if (!this.isLoading) {
      this.isLoading = true;
      this.startPlaceholderAnimation();
      this.src = this.sourceUrl;
    }

    return this.loadPromise;
  }

  // Returns a promise that resolves when the image is loaded
  public ready(): Promise<Avatar> {
    return this.loadPromise;
  }
}

// Singleton state for avatar loading
class AvatarLoader {
  private static instance: AvatarLoader;
  private _avatarSprites: Avatar[] = [];
  private _avatarLoadPromise: Promise<void> | null = null;
  private _manifestLoadPromise: Promise<Record<string, any>> | null = null;
  private _manifestLoaded: boolean = false;
  private _manifest: Record<string, any> | null = null;
  private _initialized: boolean = false;

  private constructor() { }

  // Get the singleton instance
  public static getInstance(): AvatarLoader {
    if (!AvatarLoader.instance) {
      AvatarLoader.instance = new AvatarLoader();
    }
    return AvatarLoader.instance;
  }

  // Initialize by only loading the manifest (not the actual avatars)
  public initialize(): Promise<void> {
    // If already initialized, return existing promise
    if (this._initialized)
      return this._avatarLoadPromise || Promise.resolve();

    this._initialized = true;

    // Create and store the promise
    this._avatarLoadPromise = new Promise<void>((resolve, reject) => {
      // Only load the manifest, not the avatars
      this.loadManifest()
        .then(manifest => {
          // Process the manifest to create Avatar objects without loading them
          this.processManifest(manifest);
          resolve();
        })
        .catch(error => {
          console.error('Failed during avatar manifest loading:', error);
          reject(error);
        });
    });

    return this._avatarLoadPromise;
  }

  // Load the avatar manifest
  private loadManifest(): Promise<Record<string, any>> {
    if (this._manifestLoaded && this._manifest) {
      return Promise.resolve(this._manifest);
    }

    if (!this._manifestLoadPromise) {
      this._manifestLoadPromise = loadAvatarsManifest().then(manifest => {
        this._manifestLoaded = true;
        this._manifest = manifest;
        return manifest;
      });
    }

    return this._manifestLoadPromise;
  }

  // Process the manifest to create Avatar objects (without loading them)
  private processManifest(manifest: Record<string, any>): void {
    const avatarList = Object.keys(manifest).map(key => {
      if (!manifest[key]) {
        console.warn(`Avatar at key ${key} is undefined`);
        return null;
      }

      return (manifest[key] as Sprites.ImageModule).default;
    }).filter(Boolean) as string[];

    console.log(`Processing ${avatarList.length} avatars into metadata`);

    this._avatarSprites = avatarList.map(avatarPath => {
      // Extract the filename without extension
      const fullName = avatarPath.split('/').pop()?.split('.')[0] || '';

      // Parse the avatar filename to extract base name and variant
      let baseCharacterName = fullName;
      let variant: string | null = null;

      // check for special variants 'b' and 'dj'
      if (fullName.endsWith('b')) {
        // Handle 'nameb' format (ends with b)
        baseCharacterName = fullName.slice(0, -1);
        variant = 'b';
      }
      else if (fullName.includes('dj')) {
        // Handle 'namedj' format (contains dj)
        const djIndex = fullName.indexOf('dj');
        baseCharacterName = fullName.slice(0, djIndex);
        variant = 'dj';
      }

      return new Avatar({
        baseCharacterName,
        variant,
        fullName,
        sourceUrl: avatarPath
      });
    });
  }

  // Get all avatar sprites
  public get avatarSprites(): Avatar[] {
    return this._avatarSprites;
  }

  // Lazy load a specific avatar by full name
  public async loadAvatarByFullName(fullName: string): Promise<Avatar | undefined> {
    // Make sure manifest is loaded first
    await this.initialize();

    const avatar = this.findByFullName(fullName);
    if (!avatar) return undefined;

    return avatar.load();
  }

  // Lazy load a specific avatar by base name and variant
  public async loadAvatar(
    baseCharacterName: string,
    variant: string | null = null
  ): Promise<Avatar | undefined> {
    // Make sure manifest is loaded first
    await this.initialize();

    const avatar = this.find(baseCharacterName, variant);
    if (!avatar) return undefined;

    return avatar.load();
  }

  // Find avatar by exact full name (including variant)
  public findByFullName(fullName: string): Avatar | undefined {
    return this._avatarSprites.find((avatar) => avatar.fullName === fullName);
  }

  // Find avatar by base name and optional variant
  public find(baseCharacterName: string, variant: string | null = null): Avatar | undefined {
    // First try to find exact match with specified variant
    if (variant) {
      const exactMatch = this._avatarSprites.find((avatar) =>
        avatar.baseCharacterName === baseCharacterName &&
        avatar.variant === variant
      );

      if (exactMatch) return exactMatch;
    }

    // If no variant specified or exact match not found, 
    // find the base character with no variant
    const baseMatch = this._avatarSprites.find((avatar) =>
      avatar.baseCharacterName === baseCharacterName &&
      avatar.variant === null
    );

    if (baseMatch) return baseMatch;

    // If still not found, just return any variant of this character
    return this._avatarSprites.find((avatar) =>
      avatar.baseCharacterName === baseCharacterName
    );
  }

  // Get all variants of a specific character
  public getAllVariants(baseCharacterName: string): Avatar[] {
    return this._avatarSprites.filter((avatar) =>
      avatar.baseCharacterName === baseCharacterName
    );
  }

  // Load all avatars at once (not recommended - for backwards compatibility)
  public async loadAllAvatars(): Promise<Avatar[]> {
    await this.initialize();

    const loadPromises = this._avatarSprites.map(avatar => avatar.load());
    return Promise.all(loadPromises);
  }
}

// Expose singleton methods as module functions
export const avatarLoader = AvatarLoader.getInstance();
export const avatarSprites = avatarLoader.avatarSprites;

// Initialize avatar manifest (but not load avatars)
export const initializeAvatars = (): Promise<void> => {
  return avatarLoader.initialize();
};

// Find avatar by exact full name (including variant)
export const findAvatarByFullName = (fullName: string): Avatar | undefined => {
  return avatarLoader.findByFullName(fullName);
};

// Find avatar by base name and optional variant
export const findAvatar = (
  baseCharacterName: string,
  variant: string | null = null
): Avatar | undefined => {
  return avatarLoader.find(baseCharacterName, variant);
};

// Load avatar by exact full name (including variant)
export const loadAvatarByFullName = (fullName: string): Promise<Avatar | undefined> => {
  return avatarLoader.loadAvatarByFullName(fullName);
};

// Load avatar by base name and optional variant
export const loadAvatar = (
  baseCharacterName: string,
  variant: string | null = null
): Promise<Avatar | undefined> => {
  return avatarLoader.loadAvatar(baseCharacterName, variant);
};

// Get all variants of a specific character
export const getAllVariantsForCharacter = (baseCharacterName: string): Avatar[] => {
  return avatarLoader.getAllVariants(baseCharacterName);
};

// Load all avatars (not recommended - for backwards compatibility)
export const loadAllAvatars = (): Promise<Avatar[]> => {
  return avatarLoader.loadAllAvatars();
};

// Get an object that can be used as an image source, either the real image or placeholder
export const getAvatarSource = (avatar: Avatar): string => {
  if (avatar.isLoaded) {
    return avatar.src;
  }
  return avatar.getPlaceholderDataURL();
};