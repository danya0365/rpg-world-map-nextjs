import { v4 as uuidv4 } from 'uuid';

export interface EnemyData {
  id: string;
  monsterId: string;
  x: number;
  y: number;
  worldMapId: string;
  level: number;
  isActive: boolean;
}

export class Enemy {
  private readonly id: string;
  private readonly monsterId: string;
  private x: number;
  private y: number;
  private readonly worldMapId: string;
  private readonly level: number;
  private isActive: boolean;

  constructor(data: EnemyData) {
    this.id = data.id;
    this.monsterId = data.monsterId;
    this.x = data.x;
    this.y = data.y;
    this.worldMapId = data.worldMapId;
    this.level = data.level;
    this.isActive = data.isActive;
  }

  public static create(monsterId: string, x: number, y: number, worldMapId: string, level: number = 1): Enemy {
    return new Enemy({
      id: uuidv4(),
      monsterId,
      x,
      y,
      worldMapId,
      level,
      isActive: true
    });
  }

  public getId(): string {
    return this.id;
  }

  public getMonsterId(): string {
    return this.monsterId;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public getWorldMapId(): string {
    return this.worldMapId;
  }

  public getLevel(): number {
    return this.level;
  }

  public isActiveEnemy(): boolean {
    return this.isActive;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public toJSON(): EnemyData {
    return {
      id: this.id,
      monsterId: this.monsterId,
      x: this.x,
      y: this.y,
      worldMapId: this.worldMapId,
      level: this.level,
      isActive: this.isActive
    };
  }
}
