import { Character } from '../entities/Character';

export interface CharacterRepository {
  save(character: Character): Promise<void>;
  findById(id: string, forceReload?: boolean): Promise<Character | null>;
  findAll(): Promise<Character[]>;
  delete(id: string): Promise<boolean>;
  update(character: Character): Promise<void>;
}
