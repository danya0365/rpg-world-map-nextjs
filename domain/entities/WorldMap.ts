import { Location, LocationData } from '../entities/Location';

export interface WorldMapTile {
  x: number;
  y: number;
  type: string; // grass, water, mountain, forest, etc.
  locationId?: string; // If this tile contains a location
  isWalkable: boolean;
}

export interface WorldMapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: WorldMapTile[][];
  locations: LocationData[];
}

export class WorldMap {
  private readonly id: string;
  private readonly name: string;
  private readonly width: number;
  private readonly height: number;
  private readonly tiles: WorldMapTile[][];
  private readonly locations: Map<string, Location>;

  constructor(data: WorldMapData) {
    this.id = data.id;
    this.name = data.name;
    this.width = data.width;
    this.height = data.height;
    
    // Deep copy the tiles
    this.tiles = data.tiles.map(row => row.map(tile => ({ ...tile })));
    
    // Create locations map
    this.locations = new Map();
    data.locations.forEach(locationData => {
      this.locations.set(locationData.id, new Location(locationData));
    });
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getTile(x: number, y: number): WorldMapTile | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return { ...this.tiles[y][x] };
  }

  public getAllTiles(): WorldMapTile[][] {
    return this.tiles.map(row => row.map(tile => ({ ...tile })));
  }

  public getLocation(locationId: string): Location | undefined {
    return this.locations.get(locationId);
  }

  public getAllLocations(): Location[] {
    return Array.from(this.locations.values());
  }

  public isPositionWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== null && tile.isWalkable;
  }

  public getLocationAtPosition(x: number, y: number): Location | undefined {
    const tile = this.getTile(x, y);
    if (tile && tile.locationId) {
      return this.locations.get(tile.locationId);
    }
    return undefined;
  }

  public toJSON(): WorldMapData {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      tiles: this.tiles.map(row => row.map(tile => ({ ...tile }))),
      locations: Array.from(this.locations.values()).map(location => location.toJSON())
    };
  }
}
