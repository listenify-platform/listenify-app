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
   * @description Get parsed data from storage
   * @function getStorageData
   * @returns {Record<string, any>}
   * @private
   */
  // CHANGE: Added helper method to avoid code duplication in get, set and all methods
  private getStorageData(): Record<string, any> {
    const item = this.storage.getItem(this.key);

    try {
      return item ? JSON.parse(item) : {};
    } catch (error: any) {
      throw new Error(`Failed to parse storage data for key "${this.key}": ${error.message}`);
    }
  }

  /**
   * @description Get all values from storage
   * @function all
   * @returns {Record<string, any>}
   */
  private get all(): Record<string, any> {
    // CHANGE: Using the helper method instead of duplicating code
    return this.getStorageData();
  }

  /**
   * @description Get value from storage
   * @function get
   * @param {string} key
   * @returns {T | null}
   * @template T
   */
  // CHANGE: Added generic type parameter for better type safety
  public get<T = any>(key: string): T | null {
    const data = this.getStorageData();
    return (key in data) ? data[key] : null;
  }

  /**
   * @description Set value in storage
   * @function set
   * @param {string} key
   * @param {T} value
   * @returns {void}
   * @template T
   */
  // CHANGE: Added generic type parameter for better type safety
  public set<T = any>(key: string, value: T): void {
    const data = this.getStorageData();
    data[key] = value;
    this.storage.setItem(this.key, JSON.stringify(data));
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
    const currentStorageLanguage: string | null = this.get('language');

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