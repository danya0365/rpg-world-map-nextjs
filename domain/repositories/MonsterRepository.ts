import { Monster } from '../entities/Monster';

export interface MonsterRepository {
  save(monster: Monster): Promise<void>;
  findById(id: string): Promise<Monster | null>;
  findAll(): Promise<Monster[]>;
  findByIds(ids: string[]): Promise<Monster[]>;
  delete(id: string): Promise<boolean>;
  update(monster: Monster): Promise<void>;
}
