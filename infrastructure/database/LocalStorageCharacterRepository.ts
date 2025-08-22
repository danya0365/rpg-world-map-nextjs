import { Character, CharacterData } from '../../domain/entities/Character';
import { CharacterRepository } from '../../domain/repositories/CharacterRepository';
import { LocalStorageUtil } from './LocalStorageUtil';

export class LocalStorageCharacterRepository implements CharacterRepository {
  private readonly storagePrefix = 'rpg_character_';

  private getStorageKey(id: string): string {
    return `${this.storagePrefix}${id}`;
  }

  async save(character: Character): Promise<void> {
    const characterData = character.toJSON();
    console.log('[DEBUG] Saving character to localStorage:', {
      id: characterData.id,
      name: characterData.name,
      level: characterData.stats.level,
      experience: characterData.stats.experience,
      storageKey: this.getStorageKey(characterData.id)
    });
    
    try {
      await LocalStorageUtil.setItem(this.getStorageKey(characterData.id), characterData);
      console.log('[DEBUG] Character saved successfully');
      
      // Verify the save by reading it back
      const savedData = await LocalStorageUtil.getItem<CharacterData>(this.getStorageKey(characterData.id));
      console.log('[DEBUG] Verification - Character data in localStorage:', {
        found: !!savedData,
        id: savedData?.id,
        name: savedData?.name,
        level: savedData?.stats?.level,
        experience: savedData?.stats?.experience
      });
    } catch (error) {
      console.error('[DEBUG] Error saving character:', error);
      throw error;
    }
  }

  async findById(id: string, forceReload = false): Promise<Character | null> {
    console.log(`[DEBUG] LocalStorageCharacterRepository.findById - Finding character ${id}, forceReload: ${forceReload}`);
    
    // Clear any cached data if force reload is requested
    if (forceReload) {
      console.log(`[DEBUG] LocalStorageCharacterRepository.findById - Force reloading character ${id} from localStorage`);
      // We don't have an in-memory cache in this implementation, but we'll make sure to get fresh data
    }
    
    const characterData = await LocalStorageUtil.getItem<CharacterData>(this.getStorageKey(id));
    if (!characterData) {
      console.log(`[DEBUG] LocalStorageCharacterRepository.findById - Character ${id} not found`);
      return null;
    }
    
    console.log(`[DEBUG] LocalStorageCharacterRepository.findById - Character ${id} found:`, {
      name: characterData.name,
      level: characterData.stats?.level,
      experience: characterData.stats?.experience
    });
    
    return new Character(characterData);
  }

  async findAll(): Promise<Character[]> {
    const keys = await LocalStorageUtil.getKeysByPrefix(this.storagePrefix);
    const characters: Character[] = [];

    for (const key of keys) {
      const characterData = await LocalStorageUtil.getItem<CharacterData>(key);
      if (characterData) {
        characters.push(new Character(characterData));
      }
    }

    return characters;
  }

  async delete(id: string): Promise<boolean> {
    const character = await this.findById(id);
    if (!character) {
      return false;
    }

    await LocalStorageUtil.removeItem(this.getStorageKey(id));
    return true;
  }

  async update(character: Character): Promise<void> {
    console.log('[DEBUG] Updating character:', {
      id: character.getId(),
      name: character.getName(),
      stats: character.getStats()
    });
    await this.save(character);
  }
}
