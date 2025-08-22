/**
 * Utility to test character persistence in localStorage
 */
import { Character } from '../../domain/entities/Character';
import { LocalStorageUtil } from '../../infrastructure/database/LocalStorageUtil';
import { LocalStorageCharacterRepository } from '../../infrastructure/database/LocalStorageCharacterRepository';
import { CharacterService } from '../../application/services/CharacterService';

export class CharacterPersistenceTest {
  private static readonly TEST_CHARACTER_ID = 'test-character-123';
  private static readonly STORAGE_KEY = `rpg_character_${CharacterPersistenceTest.TEST_CHARACTER_ID}`;
  
  /**
   * Run a complete test of character persistence
   */
  public static async runTest(): Promise<void> {
    console.log('=== CHARACTER PERSISTENCE TEST ===');
    
    // Create test dependencies
    const repository = new LocalStorageCharacterRepository();
    const service = new CharacterService(repository);
    
    // Clear any existing test data
    await this.clearTestData();
    
    // Create a test character
    await this.createTestCharacter(service);
    
    // Add experience and verify persistence
    await this.testExperiencePersistence(service);
    
    // Verify data directly in localStorage
    await this.verifyLocalStorage();
    
    console.log('=== TEST COMPLETE ===');
  }
  
  /**
   * Clear any existing test data
   */
  private static async clearTestData(): Promise<void> {
    console.log('Clearing test data...');
    await LocalStorageUtil.removeItem(this.STORAGE_KEY);
    console.log('Test data cleared');
  }
  
  /**
   * Create a test character
   */
  private static async createTestCharacter(service: CharacterService): Promise<Character> {
    console.log('Creating test character...');
    
    // Create character data
    const character = new Character({
      id: this.TEST_CHARACTER_ID,
      name: 'Test Character',
      stats: {
        level: 1,
        experience: 0,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        attack: 10,
        defense: 5,
        speed: 5
      },
      position: {
        x: 5,
        y: 5,
        worldMapId: 'test-world'
      },
      inventory: [],
      allies: [],
      skills: [],
      skillCooldowns: {}
    });
    
    // Save character
    await service.saveCharacter(character);
    console.log('Test character created and saved');
    
    return character;
  }
  
  /**
   * Test experience persistence
   */
  private static async testExperiencePersistence(service: CharacterService): Promise<void> {
    console.log('Testing experience persistence...');
    
    // Get initial character
    const initialCharacter = await service.getCharacter(this.TEST_CHARACTER_ID);
    if (!initialCharacter) {
      console.error('Test character not found!');
      return;
    }
    
    const initialStats = initialCharacter.getStats();
    console.log('Initial character stats:', {
      level: initialStats.level,
      experience: initialStats.experience
    });
    
    // Add experience
    const expToAdd = 50;
    console.log(`Adding ${expToAdd} experience...`);
    await service.addExperience(this.TEST_CHARACTER_ID, expToAdd);
    
    // Get updated character
    const updatedCharacter = await service.getCharacter(this.TEST_CHARACTER_ID);
    if (!updatedCharacter) {
      console.error('Updated character not found!');
      return;
    }
    
    const updatedStats = updatedCharacter.getStats();
    console.log('Updated character stats:', {
      level: updatedStats.level,
      experience: updatedStats.experience
    });
    
    // Verify experience was added
    const expectedExp = initialStats.experience + expToAdd;
    if (updatedStats.experience === expectedExp) {
      console.log('✅ Experience added correctly');
    } else {
      console.error(`❌ Experience mismatch! Expected: ${expectedExp}, Actual: ${updatedStats.experience}`);
    }
    
    // Simulate page reload by clearing and reloading from localStorage
    console.log('Simulating page reload...');
    
    // Get character after "reload"
    const reloadedCharacter = await service.getCharacter(this.TEST_CHARACTER_ID);
    if (!reloadedCharacter) {
      console.error('Reloaded character not found!');
      return;
    }
    
    const reloadedStats = reloadedCharacter.getStats();
    console.log('Reloaded character stats:', {
      level: reloadedStats.level,
      experience: reloadedStats.experience
    });
    
    // Verify experience persisted
    if (reloadedStats.experience === expectedExp) {
      console.log('✅ Experience persisted correctly after reload');
    } else {
      console.error(`❌ Experience not persisted! Expected: ${expectedExp}, Actual: ${reloadedStats.experience}`);
    }
  }
  
  /**
   * Verify data directly in localStorage
   */
  private static async verifyLocalStorage(): Promise<void> {
    console.log('Verifying localStorage directly...');
    
    // Get raw data from localStorage
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    console.log(`Raw localStorage data: ${rawData ? 'Found' : 'Not found'}`);
    
    if (rawData) {
      try {
        const parsedData = JSON.parse(rawData);
        console.log('Parsed localStorage data:', {
          id: parsedData.id,
          name: parsedData.name,
          level: parsedData.stats?.level,
          experience: parsedData.stats?.experience
        });
      } catch (e) {
        console.error('Error parsing localStorage data:', e);
      }
    }
  }
}
