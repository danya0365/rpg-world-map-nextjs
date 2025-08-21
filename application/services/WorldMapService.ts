import { v4 as uuidv4 } from 'uuid';
import { Location } from '../../domain/entities/Location';
import { WorldMap, WorldMapTile } from '../../domain/entities/WorldMap';
import { IWorldMapService } from '../../domain/interfaces/IWorldMapService';
import { WorldMapRepository } from '../../domain/repositories/WorldMapRepository';

export class WorldMapService implements IWorldMapService {
  constructor(private worldMapRepository: WorldMapRepository) {}

  async createWorldMap(name: string, width: number, height: number): Promise<WorldMap> {
    const id = uuidv4();
    
    // Create empty tiles
    const tiles: WorldMapTile[][] = [];
    for (let y = 0; y < height; y++) {
      const row: WorldMapTile[] = [];
      for (let x = 0; x < width; x++) {
        // Default to grass tiles that are walkable
        row.push({
          x,
          y,
          type: 'grass',
          isWalkable: true
        });
      }
      tiles.push(row);
    }
    
    const worldMap = new WorldMap({
      id,
      name,
      width,
      height,
      tiles,
      locations: []
    });
    
    await this.worldMapRepository.save(worldMap);
    return worldMap;
  }

  async getWorldMap(id: string): Promise<WorldMap | null> {
    return await this.worldMapRepository.findById(id);
  }

  async getAllWorldMaps(): Promise<WorldMap[]> {
    return await this.worldMapRepository.findAll();
  }

  async getTile(worldMapId: string, x: number, y: number): Promise<WorldMapTile | null> {
    const worldMap = await this.worldMapRepository.findById(worldMapId);
    if (!worldMap) {
      return null;
    }
    
    return worldMap.getTile(x, y);
  }

  // Map to store locations that have been created but not yet added to a world map
  private temporaryLocations: Map<string, Location> = new Map();

  async getLocation(locationId: string): Promise<Location | null> {
    // First check if this is a temporary location we've created but not yet added to a map
    const tempLocation = this.temporaryLocations.get(locationId);
    if (tempLocation) {
      return tempLocation;
    }
    
    // If not found in temporary locations, search in all world maps
    const worldMaps = await this.worldMapRepository.findAll();
    
    for (const worldMap of worldMaps) {
      const location = worldMap.getLocation(locationId);
      if (location) {
        return location;
      }
    }
    
    return null;
  }

  async getLocationAtPosition(worldMapId: string, x: number, y: number): Promise<Location | null> {
    const worldMap = await this.worldMapRepository.findById(worldMapId);
    if (!worldMap) {
      return null;
    }
    
    const location = worldMap.getLocationAtPosition(x, y);
    return location || null;
  }

  async isPositionWalkable(worldMapId: string, x: number, y: number): Promise<boolean> {
    const worldMap = await this.worldMapRepository.findById(worldMapId);
    if (!worldMap) {
      return false;
    }
    
    return worldMap.isPositionWalkable(x, y);
  }

  async saveWorldMap(worldMap: WorldMap): Promise<void> {
    await this.worldMapRepository.save(worldMap);
  }

  async createLocation(name: string, description: string, encounterRate: number, possibleMonsters: string[]): Promise<Location> {
    const id = uuidv4();
    
    // Create a proper EncounterRate object
    const encounterRateObj = {
      minLevel: 1,  // Default min level
      maxLevel: 100, // Default max level
      rate: encounterRate  // The rate passed as parameter
    };
    
    const location = new Location({
      id,
      name,
      description,
      type: 'default', // Adding default type
      encounterRate: encounterRateObj,
      possibleMonsters
    });
    
    // Store the location in our temporary map so we can find it before it's added to a world map
    this.temporaryLocations.set(location.getId(), location);
    
    return location;
  }

  async addLocationToMap(worldMapId: string, locationId: string, x: number, y: number): Promise<void> {
    const worldMap = await this.worldMapRepository.findById(worldMapId);
    if (!worldMap) {
      throw new Error(`World map with id ${worldMapId} not found`);
    }
    
    const location = await this.getLocation(locationId);
    if (!location) {
      throw new Error(`Location with id ${locationId} not found`);
    }
    
    // Since WorldMap doesn't have an addLocation method, we need to create a new WorldMap with the location added
    // This would typically involve updating the tile at the specified position to reference the location
    // and adding the location to the locations collection
    
    // For now, we'll create a modified copy of the world map JSON and save it
    const worldMapData = worldMap.toJSON();
    
    // Add the location to the locations array if it's not already there
    if (!worldMapData.locations.some(loc => loc.id === location.getId())) {
      worldMapData.locations.push(location.toJSON());
    }
    
    // Update the tile to reference this location
    if (x >= 0 && x < worldMapData.width && y >= 0 && y < worldMapData.height) {
      worldMapData.tiles[y][x].locationId = locationId;
    } else {
      throw new Error(`Position (${x}, ${y}) is outside the map boundaries`);
    }
    
    // Create a new WorldMap with the updated data
    const updatedWorldMap = new WorldMap(worldMapData);
    
    // Save the updated world map
    await this.worldMapRepository.save(updatedWorldMap);
    
    // Remove the location from the temporary map since it's now part of a world map
    this.temporaryLocations.delete(locationId);
  }
}
