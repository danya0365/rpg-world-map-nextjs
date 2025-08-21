import { Monster, MonsterData } from '../../domain/entities/Monster';
import { MonsterRepository } from '../../domain/repositories/MonsterRepository';
import { LocalStorageUtil } from './LocalStorageUtil';

export class LocalStorageMonsterRepository implements MonsterRepository {
  private readonly storagePrefix = 'rpg_monster_';

  private getStorageKey(id: string): string {
    return `${this.storagePrefix}${id}`;
  }

  async save(monster: Monster): Promise<void> {
    const monsterData = monster.toJSON();
    await LocalStorageUtil.setItem(this.getStorageKey(monsterData.id), monsterData);
  }

  async findById(id: string): Promise<Monster | null> {
    const monsterData = await LocalStorageUtil.getItem<MonsterData>(this.getStorageKey(id));
    if (!monsterData) {
      return null;
    }
    return new Monster(monsterData);
  }

  async findAll(): Promise<Monster[]> {
    const keys = await LocalStorageUtil.getKeysByPrefix(this.storagePrefix);
    const monsters: Monster[] = [];

    for (const key of keys) {
      const monsterData = await LocalStorageUtil.getItem<MonsterData>(key);
      if (monsterData) {
        monsters.push(new Monster(monsterData));
      }
    }

    return monsters;
  }

  async findByIds(ids: string[]): Promise<Monster[]> {
    const monsters: Monster[] = [];

    for (const id of ids) {
      const monster = await this.findById(id);
      if (monster) {
        monsters.push(monster);
      }
    }

    return monsters;
  }

  async delete(id: string): Promise<boolean> {
    const monster = await this.findById(id);
    if (!monster) {
      return false;
    }

    await LocalStorageUtil.removeItem(this.getStorageKey(id));
    return true;
  }

  async update(monster: Monster): Promise<void> {
    await this.save(monster);
  }
}
