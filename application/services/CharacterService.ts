import { v4 as uuidv4 } from 'uuid';
import { Character, Position, Stats } from '../../domain/entities/Character';
import { ICharacterService } from '../../domain/interfaces/ICharacterService';
import { CharacterRepository } from '../../domain/repositories/CharacterRepository';

export class CharacterService implements ICharacterService {
  constructor(private characterRepository: CharacterRepository) {}

  async createCharacter(name: string): Promise<Character> {
    const id = uuidv4();
    
    // Default starting stats
    const stats: Stats = {
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      attack: 10,
      defense: 5,
      speed: 5
    };
    
    // Default starting position
    const position: Position = {
      x: 5,
      y: 5,
      worldMapId: 'default-world'
    };
    
    const character = new Character({
      id,
      name,
      stats,
      position,
      inventory: [],
      allies: [],
      skills: [],
      skillCooldowns: {}
    });
    
    await this.characterRepository.save(character);
    return character;
  }

  async getCharacter(id: string, forceReload = false): Promise<Character | null> {
    console.log(`[DEBUG] CharacterService.getCharacter - Getting character ${id}, forceReload: ${forceReload}`);
    
    if (forceReload) {
      // For force reload, we first check if the character exists in the repository
      const existingCharacter = await this.characterRepository.findById(id);
      
      if (existingCharacter) {
        // If it exists, we reload it from localStorage to ensure we have the latest data
        console.log(`[DEBUG] CharacterService.getCharacter - Force reloading character ${id} from storage`);
        
        try {
          // Get the character data directly from localStorage
          return await this.characterRepository.findById(id, true);
        } catch (error) {
          console.error(`[DEBUG] CharacterService.getCharacter - Error force reloading character ${id}:`, error);
          // Fall back to the existing character if there was an error
          return existingCharacter;
        }
      }
    }
    
    // Normal flow - just get the character from the repository
    return await this.characterRepository.findById(id);
  }

  async getAllCharacters(): Promise<Character[]> {
    return await this.characterRepository.findAll();
  }

  async moveCharacter(id: string, newPosition: Partial<Position>): Promise<Character | null> {
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    character.move(newPosition);
    await this.characterRepository.update(character);
    return character;
  }

  async addExperience(id: string, amount: number): Promise<Character | null> {
    console.log(`[DEBUG] CharacterService.addExperience - Starting for character ${id}, amount: ${amount}`);
    
    // Get character before adding experience
    const character = await this.characterRepository.findById(id);
    if (!character) {
      console.log(`[DEBUG] CharacterService.addExperience - Character ${id} not found`);
      return null;
    }
    
    // Log character state before adding experience
    const beforeStats = character.getStats();
    console.log('[DEBUG] CharacterService.addExperience - Character before:', {
      id: character.getId(),
      name: character.getName(),
      level: beforeStats.level,
      experience: beforeStats.experience,
      maxHealth: beforeStats.maxHealth
    });
    
    // Add experience
    character.addExperience(amount);
    
    // Log character state after adding experience
    const afterStats = character.getStats();
    console.log('[DEBUG] CharacterService.addExperience - Character after:', {
      id: character.getId(),
      name: character.getName(),
      level: afterStats.level,
      experience: afterStats.experience,
      maxHealth: afterStats.maxHealth,
      leveledUp: afterStats.level > beforeStats.level
    });
    
    // Update character in repository
    console.log('[DEBUG] CharacterService.addExperience - Updating character in repository');
    try {
      await this.characterRepository.update(character);
      console.log('[DEBUG] CharacterService.addExperience - Character updated successfully');
    } catch (error) {
      console.error('[DEBUG] CharacterService.addExperience - Error updating character:', error);
      throw error;
    }
    
    return character;
  }

  async addItem(id: string, itemId: string): Promise<Character | null> {
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    character.addItem(itemId);
    await this.characterRepository.update(character);
    return character;
  }

  async removeItem(id: string, itemId: string): Promise<Character | null> {
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    character.removeItem(itemId);
    await this.characterRepository.update(character);
    return character;
  }

  async addAlly(id: string, monsterId: string): Promise<Character | null> {
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    character.addAlly(monsterId);
    await this.characterRepository.update(character);
    return character;
  }

  async takeDamage(id: string, amount: number): Promise<Character | null> {
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    character.takeDamage(amount);
    await this.characterRepository.update(character);
    return character;
  }

  async heal(id: string, amount: number): Promise<Character | null> {
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    character.heal(amount);
    await this.characterRepository.update(character);
    return character;
  }

  async getStats(id: string): Promise<Stats | null> {
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    return character.getStats();
  }

  async saveCharacter(character: Character): Promise<void> {
    await this.characterRepository.save(character);
  }
}
