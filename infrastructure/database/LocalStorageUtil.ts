export class LocalStorageUtil {
  private static isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  public static async getItem<T>(key: string): Promise<T | null> {
    if (!this.isLocalStorageAvailable()) {
      console.error('LocalStorage is not available');
      return null;
    }

    const item = localStorage.getItem(key);
    if (!item) {
      return null;
    }

    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Error parsing item with key ${key}:`, e);
      return null;
    }
  }

  public static async setItem(key: string, value: any): Promise<void> {
    if (!this.isLocalStorageAvailable()) {
      console.error('LocalStorage is not available');
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting item with key ${key}:`, e);
    }
  }

  public static async removeItem(key: string): Promise<void> {
    if (!this.isLocalStorageAvailable()) {
      console.error('LocalStorage is not available');
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing item with key ${key}:`, e);
    }
  }

  public static async getAllKeys(): Promise<string[]> {
    if (!this.isLocalStorageAvailable()) {
      console.error('LocalStorage is not available');
      return [];
    }

    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }

  public static async getKeysByPrefix(prefix: string): Promise<string[]> {
    const allKeys = await this.getAllKeys();
    return allKeys.filter(key => key.startsWith(prefix));
  }
}
