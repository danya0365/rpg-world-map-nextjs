import { Enemy } from '../entities/Enemy';

export interface EnemyRepository {
  save(enemy: Enemy): Promise<void>;
  findById(id: string): Promise<Enemy | null>;
  findAll(): Promise<Enemy[]>;
  findByWorldMapId(worldMapId: string): Promise<Enemy[]>;
  findActiveByWorldMapId(worldMapId: string): Promise<Enemy[]>;
  delete(id: string): Promise<boolean>;
  update(enemy: Enemy): Promise<void>;
}
