import { Enemy, EnemyData } from '../../domain/entities/Enemy';
import { EnemyRepository } from '../../domain/repositories/EnemyRepository';
import { LocalStorageUtil } from './LocalStorageUtil';

export class LocalStorageEnemyRepository implements EnemyRepository {
  private readonly storagePrefix = 'rpg_enemy_';

  private getStorageKey(id: string): string {
    return `${this.storagePrefix}${id}`;
  }

  async save(enemy: Enemy): Promise<void> {
    const enemyData = enemy.toJSON();
    await LocalStorageUtil.setItem(this.getStorageKey(enemyData.id), enemyData);
  }

  async findById(id: string): Promise<Enemy | null> {
    const enemyData = await LocalStorageUtil.getItem<EnemyData>(this.getStorageKey(id));
    if (!enemyData) {
      return null;
    }
    return new Enemy(enemyData);
  }

  async findAll(): Promise<Enemy[]> {
    const keys = await LocalStorageUtil.getKeysByPrefix(this.storagePrefix);
    const enemies: Enemy[] = [];

    for (const key of keys) {
      const enemyData = await LocalStorageUtil.getItem<EnemyData>(key);
      if (enemyData) {
        enemies.push(new Enemy(enemyData));
      }
    }

    return enemies;
  }

  async findByWorldMapId(worldMapId: string): Promise<Enemy[]> {
    const allEnemies = await this.findAll();
    return allEnemies.filter(enemy => enemy.getWorldMapId() === worldMapId);
  }

  async findActiveByWorldMapId(worldMapId: string): Promise<Enemy[]> {
    const allEnemies = await this.findByWorldMapId(worldMapId);
    return allEnemies.filter(enemy => enemy.isActiveEnemy());
  }

  async delete(id: string): Promise<boolean> {
    const enemy = await this.findById(id);
    if (!enemy) {
      return false;
    }

    await LocalStorageUtil.removeItem(this.getStorageKey(id));
    return true;
  }

  async update(enemy: Enemy): Promise<void> {
    await this.save(enemy);
  }
}
