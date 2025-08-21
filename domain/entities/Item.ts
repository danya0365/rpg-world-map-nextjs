export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  POTION = 'potion',
  KEY = 'key',
  TREASURE = 'treasure'
}

export interface ItemEffect {
  statModifier?: {
    health?: number;
    maxHealth?: number;
    attack?: number;
    defense?: number;
    speed?: number;
  };
  healing?: number;
  isConsumable: boolean;
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  effect?: ItemEffect;
  value: number; // Gold value
}

export class Item {
  private readonly id: string;
  private readonly name: string;
  private readonly description: string;
  private readonly type: ItemType;
  private readonly effect?: ItemEffect;
  private readonly value: number;

  constructor(data: ItemData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.effect = data.effect ? { ...data.effect } : undefined;
    this.value = data.value;
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

  public getType(): ItemType {
    return this.type;
  }

  public getEffect(): ItemEffect | undefined {
    return this.effect ? { ...this.effect } : undefined;
  }

  public getValue(): number {
    return this.value;
  }

  public isConsumable(): boolean {
    return this.effect?.isConsumable || false;
  }

  public isEquippable(): boolean {
    return this.type === ItemType.WEAPON || this.type === ItemType.ARMOR;
  }

  public toJSON(): ItemData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      effect: this.effect ? { ...this.effect } : undefined,
      value: this.value
    };
  }
}
