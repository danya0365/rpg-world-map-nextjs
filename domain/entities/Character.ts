export interface Position {
  x: number;
  y: number;
  worldMapId: string;
  currentLocationId?: string;
}

export interface Stats {
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface CharacterData {
  id: string;
  name: string;
  stats: Stats;
  position: Position;
  inventory: string[]; // Item IDs
  allies: string[]; // Monster IDs that have joined the character
}

export class Character {
  private readonly id: string;
  private readonly name: string;
  private stats: Stats;
  private position: Position;
  private inventory: string[];
  private allies: string[];

  constructor(data: CharacterData) {
    this.id = data.id;
    this.name = data.name;
    this.stats = { ...data.stats };
    this.position = { ...data.position };
    this.inventory = [...data.inventory];
    this.allies = [...data.allies];
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getStats(): Stats {
    return { ...this.stats };
  }

  public getPosition(): Position {
    return { ...this.position };
  }

  public getInventory(): string[] {
    return [...this.inventory];
  }

  public getAllies(): string[] {
    return [...this.allies];
  }

  public move(newPosition: Partial<Position>): void {
    this.position = { ...this.position, ...newPosition };
  }

  public addExperience(exp: number): void {
    this.stats.experience += exp;
    this.checkLevelUp();
  }

  public takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
  }

  public heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  public addItem(itemId: string): void {
    this.inventory.push(itemId);
  }

  public removeItem(itemId: string): void {
    const index = this.inventory.indexOf(itemId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  public addAlly(monsterId: string): void {
    if (!this.allies.includes(monsterId)) {
      this.allies.push(monsterId);
    }
  }

  public isDefeated(): boolean {
    return this.stats.health <= 0;
  }

  private checkLevelUp(): void {
    const experienceNeeded = this.stats.level * 100;
    
    if (this.stats.experience >= experienceNeeded) {
      this.stats.level += 1;
      this.stats.experience -= experienceNeeded;
      
      // Increase stats on level up
      this.stats.maxHealth += 10;
      this.stats.health = this.stats.maxHealth;
      this.stats.attack += 2;
      this.stats.defense += 2;
      this.stats.speed += 1;
      
      // Check if there's enough experience for another level up
      this.checkLevelUp();
    }
  }

  public toJSON(): CharacterData {
    return {
      id: this.id,
      name: this.name,
      stats: { ...this.stats },
      position: { ...this.position },
      inventory: [...this.inventory],
      allies: [...this.allies]
    };
  }
}
