/**
 * @description Custom storage
 * @class CustomStorage
 * @param {string} key
 */
class CustomStorage {
  private key: string;
  private storage: Storage = localStorage ?? window.localStorage as Storage;

  constructor(key: string) {
    if (!this.storage || !(this.storage instanceof Storage))
      throw new Error('Local storage is not supported in this browser');

    this.key = key;

    if (!this.storage.getItem(this.key))
      this.storage.setItem(this.key, JSON.stringify({}));
  }

  /**
   * @description Get all values from storage
   * @function all
   * @returns {Record<string, any>}
   */
  private get all(): Record<string, any> {
    const item = this.storage.getItem(this.key);

    let preparsed;

    try {
      preparsed = item ? JSON.parse(item) : null;
    } catch (error) {
      throw error;
    }

    return preparsed;
  }

  /**
   * @description Get value from storage
   * @function get
   * @param {string} key
   * @returns {any | null}
   */
  public get(key: string): any | null {
    const item = this.storage.getItem(this.key);

    let preparsed;

    try {
      preparsed = item ? JSON.parse(item) : null;
    } catch (error) {
      throw error;
    }

    return preparsed[key] ?? null;
  }

  /**
   * @description Set value in storage
   * @function set
   * @param {string} key
   * @param {any} value
   * @returns {void}
   */
  public set(key: string, value: any): void {
    const item = this.storage.getItem(this.key);

    let preparsed;

    try {
      preparsed = item ? JSON.parse(item) : null;
    } catch (error) {
      throw error;
    }

    preparsed[key] = value;
    this.storage.setItem(this.key, JSON.stringify(preparsed));
  }

  /**
   * @function has
   * @param {string} key
   * @returns {boolean}
   * @description Check if key exists in storage
   */
  public has(key: string): boolean {
    return key in this.all;
  }

  /**
   * @description Destroy storage
   * @function destroy
   * @returns {void}
   */
  public destroy(): void {
    this.storage.removeItem(this.key);
  }
}

/**
 * Modules
 */
class UserStorageModule extends CustomStorage {
  // Initialize user storage
  private initialize(): void {
    const currentLanguage: string = navigator.language ?? 'en-US';
    const currentStorageLanguage: string = this.get('language');

    if (!this.has('language') || currentStorageLanguage !== currentLanguage) this.set('language', currentLanguage);
  }

  constructor() {
    super('user');

    this.initialize();
  }
}

/**
 * Export modules
 */
export const userStorage: UserStorageModule = new UserStorageModule();