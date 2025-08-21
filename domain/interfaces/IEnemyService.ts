import { Enemy } from '../entities/Enemy';

export interface IEnemyService {
  createEnemy(monsterId: string, x: number, y: number, worldMapId: string, level?: number): Promise<Enemy>;
  getEnemy(enemyId: string): Promise<Enemy | null>;
  getAllEnemies(): Promise<Enemy[]>;
  getEnemiesByWorldMapId(worldMapId: string): Promise<Enemy[]>;
  getActiveEnemiesByWorldMapId(worldMapId: string): Promise<Enemy[]>;
  moveEnemy(enemyId: string, x: number, y: number): Promise<void>;
  deactivateEnemy(enemyId: string): Promise<void>;
  spawnRandomEnemies(worldMapId: string, count: number, monsterIds: string[]): Promise<Enemy[]>;
}
