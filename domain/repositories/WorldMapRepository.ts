import { WorldMap } from '../entities/WorldMap';

export interface WorldMapRepository {
  save(worldMap: WorldMap): Promise<void>;
  findById(id: string): Promise<WorldMap | null>;
  findAll(): Promise<WorldMap[]>;
  delete(id: string): Promise<boolean>;
  update(worldMap: WorldMap): Promise<void>;
}
