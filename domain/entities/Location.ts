export interface EncounterRate {
  minLevel: number;
  maxLevel: number;
  rate: number; // 0-1 chance of encounter per step
}

export interface LocationData {
  id: string;
  name: string;
  description: string;
  type: string; // town, dungeon, forest, etc.
  encounterRate: EncounterRate;
  possibleMonsters: string[]; // Monster IDs that can be encountered here
}

export class Location {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly type: string;
  private readonly encounterRate: EncounterRate;
  private readonly possibleMonsters: string[];

  constructor(data: LocationData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.encounterRate = { ...data.encounterRate };
    this.possibleMonsters = [...data.possibleMonsters];
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getType(): string {
    return this.type;
  }

  public getEncounterRate(): EncounterRate {
    return { ...this.encounterRate };
  }

  public getPossibleMonsters(): string[] {
    return [...this.possibleMonsters];
  }

  public checkEncounter(characterLevel: number): boolean {
    // No encounters if character level is outside the range
    if (characterLevel < this.encounterRate.minLevel || 
        characterLevel > this.encounterRate.maxLevel) {
      return false;
    }
    
    return Math.random() < this.encounterRate.rate;
  }

  public getRandomMonsterId(): string | null {
    if (this.possibleMonsters.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * this.possibleMonsters.length);
    return this.possibleMonsters[randomIndex];
  }

  public toJSON(): LocationData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      encounterRate: { ...this.encounterRate },
      possibleMonsters: [...this.possibleMonsters]
    };
  }
}
