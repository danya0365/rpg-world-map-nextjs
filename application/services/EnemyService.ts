// No need to import uuidv4 here as it's used in the Enemy entity
import { Enemy } from '../../domain/entities/Enemy';
import { IEnemyService } from '../../domain/interfaces/IEnemyService';
import { IWorldMapService } from '../../domain/interfaces/IWorldMapService';
import { EnemyRepository } from '../../domain/repositories/EnemyRepository';
import { MonsterRepository } from '../../domain/repositories/MonsterRepository';

export class EnemyService implements IEnemyService {
  constructor(
    private enemyRepository: EnemyRepository,
    private monsterRepository: MonsterRepository,
    private worldMapService: IWorldMapService
  ) {}

  async createEnemy(monsterId: string, x: number, y: number, worldMapId: string, level: number = 1): Promise<Enemy> {
    // Verify monster exists
    const monster = await this.monsterRepository.findById(monsterId);
    if (!monster) {
      throw new Error(`Monster with id ${monsterId} not found`);
    }

    // Verify position is valid
    const isWalkable = await this.worldMapService.isPositionWalkable(worldMapId, x, y);
    if (!isWalkable) {
      throw new Error(`Position (${x}, ${y}) is not walkable on map ${worldMapId}`);
    }

    // Create and save enemy
    const enemy = Enemy.create(monsterId, x, y, worldMapId, level);
    await this.enemyRepository.save(enemy);
    return enemy;
  }

  async getEnemy(enemyId: string): Promise<Enemy | null> {
    return await this.enemyRepository.findById(enemyId);
  }

  async getAllEnemies(): Promise<Enemy[]> {
    return await this.enemyRepository.findAll();
  }

  async getEnemiesByWorldMapId(worldMapId: string): Promise<Enemy[]> {
    return await this.enemyRepository.findByWorldMapId(worldMapId);
  }

  async getActiveEnemiesByWorldMapId(worldMapId: string): Promise<Enemy[]> {
    return await this.enemyRepository.findActiveByWorldMapId(worldMapId);
  }

  async moveEnemy(enemyId: string, x: number, y: number): Promise<void> {
    const enemy = await this.enemyRepository.findById(enemyId);
    if (!enemy) {
      throw new Error(`Enemy with id ${enemyId} not found`);
    }

    // Verify position is valid
    const isWalkable = await this.worldMapService.isPositionWalkable(enemy.getWorldMapId(), x, y);
    if (!isWalkable) {
      throw new Error(`Position (${x}, ${y}) is not walkable on map ${enemy.getWorldMapId()}`);
    }

    enemy.setPosition(x, y);
    await this.enemyRepository.update(enemy);
  }

  async deactivateEnemy(enemyId: string): Promise<void> {
    const enemy = await this.enemyRepository.findById(enemyId);
    if (!enemy) {
      throw new Error(`Enemy with id ${enemyId} not found`);
    }

    enemy.deactivate();
    await this.enemyRepository.update(enemy);
  }

  async spawnRandomEnemies(worldMapId: string, count: number, monsterIds: string[]): Promise<Enemy[]> {
    if (monsterIds.length === 0) {
      throw new Error('No monster IDs provided for spawning enemies');
    }

    const worldMap = await this.worldMapService.getWorldMap(worldMapId);
    if (!worldMap) {
      throw new Error(`World map with id ${worldMapId} not found`);
    }

    const width = worldMap.getWidth();
    const height = worldMap.getHeight();
    const enemies: Enemy[] = [];

    // Try to spawn the requested number of enemies
    let attempts = 0;
    const maxAttempts = count * 10; // Limit attempts to avoid infinite loop
    
    while (enemies.length < count && attempts < maxAttempts) {
      attempts++;
      
      // Generate random position
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      
      // Check if position is walkable
      if (await this.worldMapService.isPositionWalkable(worldMapId, x, y)) {
        // Select random monster ID
        const randomMonsterIndex = Math.floor(Math.random() * monsterIds.length);
        const monsterId = monsterIds[randomMonsterIndex];
        
        try {
          // Create enemy with random level between 1-5
          const level = Math.floor(Math.random() * 5) + 1;
          const enemy = await this.createEnemy(monsterId, x, y, worldMapId, level);
          enemies.push(enemy);
        } catch (error) {
          console.error(`Failed to create enemy: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Continue to next attempt
        }
      }
    }

    return enemies;
  }
}
