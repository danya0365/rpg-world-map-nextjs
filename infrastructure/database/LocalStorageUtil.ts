export class LocalStorageUtil {
  private static isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (_) {
      return false;
    }
  }

  public static async getItem<T>(key: string): Promise<T | null> {
    console.log(`[DEBUG] LocalStorageUtil.getItem - Attempting to get key: ${key}`);
    
    if (!this.isLocalStorageAvailable()) {
      console.error('[DEBUG] LocalStorageUtil.getItem - LocalStorage is not available');
      return null;
    }

    const item = localStorage.getItem(key);
    if (!item) {
      console.log(`[DEBUG] LocalStorageUtil.getItem - No item found for key: ${key}`);
      return null;
    }

    console.log(`[DEBUG] LocalStorageUtil.getItem - Found item for key: ${key}, length: ${item.length} characters`);
    
    try {
      const parsedItem = JSON.parse(item) as T;
      console.log(`[DEBUG] LocalStorageUtil.getItem - Successfully parsed item for key: ${key}`);
      return parsedItem;
    } catch (e) {
      console.error(`[DEBUG] LocalStorageUtil.getItem - Error parsing item with key ${key}:`, e);
      return null;
    }
  }

  public static async setItem(key: string, value: unknown): Promise<void> {
    console.log(`[DEBUG] LocalStorageUtil.setItem - Attempting to save key: ${key}`);
    
    if (!this.isLocalStorageAvailable()) {
      console.error('[DEBUG] LocalStorageUtil.setItem - LocalStorage is not available');
      return;
    }

    try {
      const valueStr = JSON.stringify(value);
      console.log(`[DEBUG] LocalStorageUtil.setItem - Stringified value length: ${valueStr.length} characters`);
      
      // Save to localStorage
      localStorage.setItem(key, valueStr);
      
      // Verify the save
      const savedItem = localStorage.getItem(key);
      if (savedItem) {
        console.log(`[DEBUG] LocalStorageUtil.setItem - Successfully saved and verified key: ${key}`);
      } else {
        console.error(`[DEBUG] LocalStorageUtil.setItem - Failed to verify save for key: ${key}`);
      }
    } catch (e) {
      console.error(`[DEBUG] LocalStorageUtil.setItem - Error setting item with key ${key}:`, e);
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
