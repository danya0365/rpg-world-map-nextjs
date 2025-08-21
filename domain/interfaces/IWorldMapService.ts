import { Location } from '../entities/Location';
import { WorldMap, WorldMapTile } from '../entities/WorldMap';

export interface IWorldMapService {
  createWorldMap(name: string, width: number, height: number): Promise<WorldMap>;
  getWorldMap(id: string): Promise<WorldMap | null>;
  getAllWorldMaps(): Promise<WorldMap[]>;
  getTile(worldMapId: string, x: number, y: number): Promise<WorldMapTile | null>;
  getLocation(locationId: string): Promise<Location | null>;
  getLocationAtPosition(worldMapId: string, x: number, y: number): Promise<Location | null>;
  isPositionWalkable(worldMapId: string, x: number, y: number): Promise<boolean>;
  saveWorldMap(worldMap: WorldMap): Promise<void>;
  createLocation(name: string, description: string, encounterRate: number, possibleMonsters: string[]): Promise<Location>;
  addLocationToMap(worldMapId: string, locationId: string, x: number, y: number): Promise<void>;
}
