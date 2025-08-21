export enum SkillType {
  ATTACK = 'attack',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff'
}

export enum SkillTarget {
  SELF = 'self',
  ENEMY = 'enemy',
  ALL_ENEMIES = 'all_enemies'
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff_attack' | 'buff_defense' | 'debuff_attack' | 'debuff_defense';
  value: number;
  duration?: number; // For buffs/debuffs (in turns)
}

export interface SkillData {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  target: SkillTarget;
  effects: SkillEffect[];
  manaCost: number;
  cooldown: number; // Turns before skill can be used again
  requiredLevel: number;
  icon?: string;
}

export class Skill {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly type: SkillType;
  private readonly target: SkillTarget;
  private readonly effects: SkillEffect[];
  private readonly manaCost: number;
  private readonly cooldown: number;
  private readonly requiredLevel: number;
  private readonly icon?: string;

  constructor(data: SkillData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.target = data.target;
    this.effects = [...data.effects];
    this.manaCost = data.manaCost;
    this.cooldown = data.cooldown;
    this.requiredLevel = data.requiredLevel;
    this.icon = data.icon;
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

  public getType(): SkillType {
    return this.type;
  }

  public getTarget(): SkillTarget {
    return this.target;
  }

  public getEffects(): SkillEffect[] {
    return [...this.effects];
  }

  public getManaCost(): number {
    return this.manaCost;
  }

  public getCooldown(): number {
    return this.cooldown;
  }

  public getRequiredLevel(): number {
    return this.requiredLevel;
  }

  public getIcon(): string | undefined {
    return this.icon;
  }

  public canBeUsedByLevel(characterLevel: number): boolean {
    return characterLevel >= this.requiredLevel;
  }

  public toJSON(): SkillData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      target: this.target,
      effects: [...this.effects],
      manaCost: this.manaCost,
      cooldown: this.cooldown,
      requiredLevel: this.requiredLevel,
      icon: this.icon
    };
  }
}
