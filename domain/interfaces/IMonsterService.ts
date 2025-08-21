import { Monster } from '../entities/Monster';

export interface IMonsterService {
  createMonster(name: string, type: string): Promise<Monster>;
  getMonster(id: string): Promise<Monster | null>;
  getAllMonsters(): Promise<Monster[]>;
  getMonstersByIds(ids: string[]): Promise<Monster[]>;
  takeDamage(id: string, amount: number): Promise<Monster | null>;
  heal(id: string, amount: number): Promise<Monster | null>;
  attemptRecruitment(id: string, playerLevel: number): Promise<boolean>;
  rollForDrop(id: string): Promise<string | null>;
  saveMonster(monster: Monster): Promise<void>;
}
