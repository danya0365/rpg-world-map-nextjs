import { WorldMap, WorldMapData } from '../../domain/entities/WorldMap';
import { WorldMapRepository } from '../../domain/repositories/WorldMapRepository';
import { LocalStorageUtil } from './LocalStorageUtil';

export class LocalStorageWorldMapRepository implements WorldMapRepository {
  private readonly storagePrefix = 'rpg_world_map_';

  private getStorageKey(id: string): string {
    return `${this.storagePrefix}${id}`;
  }

  async save(worldMap: WorldMap): Promise<void> {
    const worldMapData = worldMap.toJSON();
    await LocalStorageUtil.setItem(this.getStorageKey(worldMapData.id), worldMapData);
  }

  async findById(id: string): Promise<WorldMap | null> {
    const worldMapData = await LocalStorageUtil.getItem<WorldMapData>(this.getStorageKey(id));
    if (!worldMapData) {
      return null;
    }
    return new WorldMap(worldMapData);
  }

  async findAll(): Promise<WorldMap[]> {
    const keys = await LocalStorageUtil.getKeysByPrefix(this.storagePrefix);
    const worldMaps: WorldMap[] = [];

    for (const key of keys) {
      const worldMapData = await LocalStorageUtil.getItem<WorldMapData>(key);
      if (worldMapData) {
        worldMaps.push(new WorldMap(worldMapData));
      }
    }

    return worldMaps;
  }

  async delete(id: string): Promise<boolean> {
    const worldMap = await this.findById(id);
    if (!worldMap) {
      return false;
    }

    await LocalStorageUtil.removeItem(this.getStorageKey(id));
    return true;
  }

  async update(worldMap: WorldMap): Promise<void> {
    await this.save(worldMap);
  }
}
