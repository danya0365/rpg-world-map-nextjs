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
  mana: number;
  maxMana: number;
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
  skills: string[]; // Skill IDs that the character has learned
  skillCooldowns: Record<string, number>; // Skill ID -> remaining cooldown turns
}

export class Character {
  private readonly id: string;
  private readonly name: string;
  private stats: Stats;
  private position: Position;
  private inventory: string[];
  private allies: string[];
  private skills: string[];
  private skillCooldowns: Record<string, number>;

  constructor(data: CharacterData) {
    this.id = data.id;
    this.name = data.name;
    this.stats = { ...data.stats };
    this.position = { ...data.position };
    this.inventory = Array.isArray(data.inventory) ? [...data.inventory] : [];
    this.allies = Array.isArray(data.allies) ? [...data.allies] : [];
    this.skills = Array.isArray(data.skills) ? [...data.skills] : [];
    this.skillCooldowns = data.skillCooldowns ? { ...data.skillCooldowns } : {};
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

  public useMana(amount: number): boolean {
    if (this.stats.mana >= amount) {
      this.stats.mana -= amount;
      return true;
    }
    return false;
  }

  public restoreMana(amount: number): void {
    this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + amount);
  }

  public addItem(itemId: string): void {
    // Initialize inventory array if it doesn't exist
    if (!Array.isArray(this.inventory)) {
      this.inventory = [];
    }
    this.inventory.push(itemId);
  }

  public removeItem(itemId: string): void {
    if (!Array.isArray(this.inventory)) {
      this.inventory = [];
      return;
    }
    
    const index = this.inventory.indexOf(itemId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
    }
  }

  public addAlly(monsterId: string): void {
    // Initialize allies array if it doesn't exist
    if (!Array.isArray(this.allies)) {
      this.allies = [];
    }
    this.allies.push(monsterId);
  }

  public learnSkill(skillId: string): void {
    // Initialize skills array if it doesn't exist
    if (!Array.isArray(this.skills)) {
      this.skills = [];
    }
    
    if (!this.skills.includes(skillId)) {
      this.skills.push(skillId);
    }
  }

  public hasSkill(skillId: string): boolean {
    return Array.isArray(this.skills) && this.skills.includes(skillId);
  }

  public getSkills(): string[] {
    return Array.isArray(this.skills) ? [...this.skills] : [];
  }

  public isSkillOnCooldown(skillId: string): boolean {
    return (this.skillCooldowns[skillId] || 0) > 0;
  }

  public setSkillCooldown(skillId: string, turns: number): void {
    this.skillCooldowns[skillId] = turns;
  }

  public reduceSkillCooldowns(): void {
    for (const skillId in this.skillCooldowns) {
      if (this.skillCooldowns[skillId] > 0) {
        this.skillCooldowns[skillId]--;
      }
    }
  }

  public getSkillCooldown(skillId: string): number {
    return this.skillCooldowns[skillId] || 0;
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
      this.stats.maxMana += 5;
      this.stats.mana = this.stats.maxMana;
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
      inventory: Array.isArray(this.inventory) ? [...this.inventory] : [],
      allies: Array.isArray(this.allies) ? [...this.allies] : [],
      skills: Array.isArray(this.skills) ? [...this.skills] : [],
      skillCooldowns: this.skillCooldowns ? { ...this.skillCooldowns } : {}
    };
  }
}
