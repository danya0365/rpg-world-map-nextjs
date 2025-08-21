import { Character, Position, Stats } from '../entities/Character';

export interface ICharacterService {
  createCharacter(name: string): Promise<Character>;
  getCharacter(id: string): Promise<Character | null>;
  getAllCharacters(): Promise<Character[]>;
  moveCharacter(id: string, newPosition: Partial<Position>): Promise<Character | null>;
  addExperience(id: string, amount: number): Promise<Character | null>;
  addItem(id: string, itemId: string): Promise<Character | null>;
  removeItem(id: string, itemId: string): Promise<Character | null>;
  addAlly(id: string, monsterId: string): Promise<Character | null>;
  takeDamage(id: string, amount: number): Promise<Character | null>;
  heal(id: string, amount: number): Promise<Character | null>;
  getStats(id: string): Promise<Stats | null>;
  saveCharacter(character: Character): Promise<void>;
}
