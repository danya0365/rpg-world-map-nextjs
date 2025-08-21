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
      allies: []
    });
    
    await this.characterRepository.save(character);
    return character;
  }

  async getCharacter(id: string): Promise<Character | null> {
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
    const character = await this.characterRepository.findById(id);
    if (!character) {
      return null;
    }
    
    character.addExperience(amount);
    await this.characterRepository.update(character);
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
