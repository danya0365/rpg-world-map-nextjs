/**
 * Utility to directly test localStorage functionality
 */
export class LocalStorageDebugger {
  /**
   * Test if localStorage is working correctly
   */
  public static testLocalStorage(): void {
    console.log('[DEBUG] Starting direct localStorage test');
    
    try {
      // Test basic functionality
      const testKey = 'test_localStorage_key';
      const testValue = { 
        id: 'test123', 
        name: 'Test Character',
        stats: { 
          level: 5, 
          experience: 250,
          health: 100,
          maxHealth: 100
        }
      };
      
      // Clear any existing test data
      localStorage.removeItem(testKey);
      
      // Test setting item
      console.log('[DEBUG] Setting test item in localStorage');
      const valueStr = JSON.stringify(testValue);
      localStorage.setItem(testKey, valueStr);
      
      // Verify item was set
      console.log('[DEBUG] Verifying test item was set');
      const rawData = localStorage.getItem(testKey);
      console.log(`[DEBUG] Raw data retrieved: ${rawData ? 'Data found' : 'No data found'}`);
      
      if (rawData) {
        // Parse and verify data
        const parsedData = JSON.parse(rawData);
        console.log('[DEBUG] Parsed data:', parsedData);
        console.log('[DEBUG] Data integrity check:', 
          parsedData.id === testValue.id ? 'PASSED' : 'FAILED',
          parsedData.stats.experience === testValue.stats.experience ? 'PASSED' : 'FAILED'
        );
      } else {
        console.error('[DEBUG] Failed to retrieve test data from localStorage');
      }
      
      // Clean up
      localStorage.removeItem(testKey);
      console.log('[DEBUG] Test cleanup complete');
      
    } catch (error) {
      console.error('[DEBUG] Error during localStorage test:', error);
    }
  }
  
  /**
   * Inspect a specific character in localStorage
   */
  public static inspectCharacter(characterId: string): void {
    console.log(`[DEBUG] Inspecting character ${characterId} in localStorage`);
    
    try {
      const storageKey = `rpg_character_${characterId}`;
      const rawData = localStorage.getItem(storageKey);
      
      console.log(`[DEBUG] Character data for ${characterId}:`, rawData ? 'Found' : 'Not found');
      
      if (rawData) {
        try {
          const parsedData = JSON.parse(rawData);
          console.log('[DEBUG] Character data details:', {
            id: parsedData.id,
            name: parsedData.name,
            level: parsedData.stats?.level,
            experience: parsedData.stats?.experience,
            health: parsedData.stats?.health,
            maxHealth: parsedData.stats?.maxHealth
          });
        } catch (e) {
          console.error('[DEBUG] Error parsing character data:', e);
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error inspecting character:', error);
    }
  }
  
  /**
   * List all RPG character keys in localStorage
   */
  public static listAllCharacters(): void {
    console.log('[DEBUG] Listing all RPG character keys in localStorage');
    
    try {
      const characterPrefix = 'rpg_character_';
      const allKeys = [];
      
      // Get all keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(characterPrefix)) {
          allKeys.push(key);
        }
      }
      
      console.log(`[DEBUG] Found ${allKeys.length} character keys in localStorage:`, allKeys);
      
      // Display brief info for each character
      allKeys.forEach(key => {
        try {
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const parsedData = JSON.parse(rawData);
            console.log(`[DEBUG] Character ${key}:`, {
              id: parsedData.id,
              name: parsedData.name,
              level: parsedData.stats?.level,
              experience: parsedData.stats?.experience
            });
          }
        } catch (e) {
          console.error(`[DEBUG] Error parsing data for key ${key}:`, e);
        }
      });
      
    } catch (error) {
      console.error('[DEBUG] Error listing characters:', error);
    }
  }
}
