export interface MonsterStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  experienceReward: number;
}

export interface MonsterData {
  id: string;
  name: string;
  type: string;
  stats: MonsterStats;
  canBeRecruited: boolean;
  dropRate: number; // Chance to drop an item (0-1)
  possibleDrops: string[]; // Item IDs that this monster can drop
}

export class Monster {
  private readonly id: string;
  private readonly name: string;
  private readonly type: string;
  private stats: MonsterStats;
  private readonly canBeRecruited: boolean;
  private readonly dropRate: number;
  private readonly possibleDrops: string[];

  constructor(data: MonsterData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.stats = { ...data.stats };
    this.canBeRecruited = data.canBeRecruited;
    this.dropRate = data.dropRate;
    this.possibleDrops = [...data.possibleDrops];
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getType(): string {
    return this.type;
  }

  public getStats(): MonsterStats {
    return { ...this.stats };
  }

  public isRecruitmentPossible(): boolean {
    return this.canBeRecruited;
  }

  public getDropRate(): number {
    return this.dropRate;
  }

  public getPossibleDrops(): string[] {
    return [...this.possibleDrops];
  }

  public takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
  }

  public heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }

  public isDefeated(): boolean {
    return this.stats.health <= 0;
  }

  public getExperienceReward(): number {
    return this.stats.experienceReward;
  }

  public attemptRecruitment(playerLevel: number): boolean {
    if (!this.canBeRecruited || !this.isDefeated()) {
      return false;
    }
    
    // Higher player level increases recruitment chance
    const baseChance = 0.2;
    const levelBonus = playerLevel * 0.02;
    const recruitmentChance = Math.min(0.8, baseChance + levelBonus);
    
    return Math.random() < recruitmentChance;
  }

  public rollForDrop(): string | null {
    if (Math.random() > this.dropRate) {
      return null;
    }
    
    if (this.possibleDrops.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * this.possibleDrops.length);
    return this.possibleDrops[randomIndex];
  }

  public toJSON(): MonsterData {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      stats: { ...this.stats },
      canBeRecruited: this.canBeRecruited,
      dropRate: this.dropRate,
      possibleDrops: [...this.possibleDrops]
    };
  }
}
