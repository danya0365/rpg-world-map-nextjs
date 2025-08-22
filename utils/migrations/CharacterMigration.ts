import { CharacterData } from '../../domain/entities/Character';
import { LocalStorageUtil } from '../../infrastructure/database/LocalStorageUtil';

export class CharacterMigration {
  /**
   * Fixes experience persistence issues by ensuring all character data
   * is properly structured and saved correctly
   */
  public async fixExperiencePersistence(): Promise<void> {
    console.log('🔄 Starting character experience persistence fix...');
    
    const keys = await LocalStorageUtil.getKeysByPrefix(this.storagePrefix);
    let fixedCount = 0;

    for (const key of keys) {
      try {
        // Get character data
        const characterData = await LocalStorageUtil.getItem<Partial<CharacterData>>(key);
        if (!characterData) {
          console.log(`⚠️ No data found for key: ${key}`);
          continue;
        }
        
        // Check if stats are properly structured
        if (!characterData.stats || typeof characterData.stats !== 'object') {
          console.log(`⚠️ Character ${characterData.name || 'Unknown'} has invalid stats structure`);
          characterData.stats = {
            level: 1,
            experience: 0,
            health: 100,
            maxHealth: 100,
            attack: 10,
            defense: 5,
            speed: 5,
            mana: 10,
            maxMana: 10
          };
        }
        
        // Ensure experience is a number
        if (typeof characterData.stats.experience !== 'number') {
          console.log(`⚠️ Character ${characterData.name || 'Unknown'} has invalid experience value: ${characterData.stats.experience}`);
          characterData.stats.experience = 0;
        }
        
        // Ensure level is a number
        if (typeof characterData.stats.level !== 'number') {
          console.log(`⚠️ Character ${characterData.name || 'Unknown'} has invalid level value: ${characterData.stats.level}`);
          characterData.stats.level = 1;
        }
        
        // Save the fixed character data
        await LocalStorageUtil.setItem(key, characterData);
        console.log(`✅ Fixed character: ${characterData.name}, Level: ${characterData.stats.level}, Experience: ${characterData.stats.experience}`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ Error fixing character data for key ${key}:`, error);
      }
    }

    console.log(`🎉 Experience persistence fix completed! ${fixedCount} characters fixed.`);
  }
  private readonly storagePrefix = 'rpg_character_';

  public async migrateToSkillsSystem(): Promise<void> {
    console.log('🔄 Starting character migration to skills system...');
    
    const keys = await LocalStorageUtil.getKeysByPrefix(this.storagePrefix);
    let migratedCount = 0;

    for (const key of keys) {
      const characterData = await LocalStorageUtil.getItem<Partial<CharacterData>>(key);
      if (characterData && this.needsMigration(characterData)) {
        const migratedData = this.migrateCharacterData(characterData);
        await LocalStorageUtil.setItem(key, migratedData);
        migratedCount++;
        console.log(`✅ Migrated character: ${migratedData.name}`);
      }
    }

    console.log(`🎉 Migration completed! ${migratedCount} characters migrated.`);
  }

  private needsMigration(data: any): boolean {
    // Check if data is valid
    if (!data) return true;
    
    // Check if skills exists and is an array
    const hasValidSkills = data.skills && Array.isArray(data.skills);
    
    // Check if skillCooldowns exists
    const hasSkillCooldowns = data.skillCooldowns !== undefined;
    
    // Check if stats exists and has mana properties
    const hasStats = data.stats && typeof data.stats === 'object';
    const hasManaStats = hasStats && 
                        typeof data.stats.mana !== 'undefined' && 
                        typeof data.stats.maxMana !== 'undefined';
    
    // Need migration if any of these conditions are not met
    return !hasValidSkills || !hasSkillCooldowns || !hasManaStats;
  }

  private migrateCharacterData(oldData: Partial<CharacterData>): CharacterData {
    // Ensure stats exists and is an object
    const stats = oldData.stats ? { ...oldData.stats } : {
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 5,
      mana: 10,
      maxMana: 10
    };
    
    // Add mana system if missing
    if (typeof stats.mana === 'undefined') {
      stats.mana = Math.floor((stats.level || 1) * 10); // Base mana based on level
    }
    if (typeof stats.maxMana === 'undefined') {
      stats.maxMana = Math.floor((stats.level || 1) * 10); // Base max mana based on level
    }

    // Add skills array if missing or ensure it's an array
    let skills: string[] = [];
    try {
      if (oldData.skills && Array.isArray(oldData.skills)) {
        skills = [...oldData.skills];
      } else if (oldData.skills) {
        console.warn(`Character ${oldData.name || 'Unknown'} had non-array skills data, resetting skills`);
      }
    } catch (error) {
      console.error('Error processing skills data:', error);
      // Ensure skills is initialized as an empty array if there's an error
      skills = [];
    }
    
    // Add basic skills based on character level
    if (stats.level >= 2 && !skills.includes('heal')) {
      skills.push('heal');
    }
    if (stats.level >= 3 && !skills.includes('fireball')) {
      skills.push('fireball');
    }
    if (stats.level >= 3 && !skills.includes('shield_up')) {
      skills.push('shield_up');
    }
    if (stats.level >= 4 && !skills.includes('battle_cry')) {
      skills.push('battle_cry');
    }
    if (stats.level >= 5 && !skills.includes('power_strike')) {
      skills.push('power_strike');
    }
    if (stats.level >= 6 && !skills.includes('ice_shard')) {
      skills.push('ice_shard');
    }

    // Add skill cooldowns if missing
    const skillCooldowns: Record<string, number> = oldData.skillCooldowns || {};

    // Ensure all required fields exist and have proper types
    return {
      id: oldData.id || `char_${Date.now()}`,
      name: oldData.name || 'Unnamed Character',
      stats,
      position: oldData.position || { x: 0, y: 0, worldMapId: 'default' },
      inventory: Array.isArray(oldData.inventory) ? [...oldData.inventory] : [],
      allies: Array.isArray(oldData.allies) ? [...oldData.allies] : [],
      skills, // Already guaranteed to be an array
      skillCooldowns
    };
  }
}
