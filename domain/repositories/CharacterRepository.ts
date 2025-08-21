import { Character, CharacterData } from '../entities/Character';

export interface CharacterRepository {
  save(character: Character): Promise<void>;
  findById(id: string): Promise<Character | null>;
  findAll(): Promise<Character[]>;
  delete(id: string): Promise<boolean>;
  update(character: Character): Promise<void>;
}
