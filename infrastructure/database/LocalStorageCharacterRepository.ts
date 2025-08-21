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
    await LocalStorageUtil.setItem(this.getStorageKey(characterData.id), characterData);
  }

  async findById(id: string): Promise<Character | null> {
    const characterData = await LocalStorageUtil.getItem<CharacterData>(this.getStorageKey(id));
    if (!characterData) {
      return null;
    }
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
    await this.save(character);
  }
}
