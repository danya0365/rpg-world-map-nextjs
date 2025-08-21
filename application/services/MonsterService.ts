import { v4 as uuidv4 } from 'uuid';
import { Monster, MonsterStats } from '../../domain/entities/Monster';
import { IMonsterService } from '../../domain/interfaces/IMonsterService';
import { MonsterRepository } from '../../domain/repositories/MonsterRepository';

export class MonsterService implements IMonsterService {
  constructor(private monsterRepository: MonsterRepository) {}

  async createMonster(name: string, type: string): Promise<Monster> {
    const id = uuidv4();
    
    // Default monster stats based on type
    let stats: MonsterStats;
    let canBeRecruited = false;
    let dropRate = 0.3;
    let possibleDrops: string[] = [];
    
    switch (type) {
      case 'slime':
        stats = {
          health: 30,
          maxHealth: 30,
          attack: 5,
          defense: 2,
          speed: 3,
          experienceReward: 10
        };
        canBeRecruited = true;
        possibleDrops = ['potion_small'];
        break;
      case 'goblin':
        stats = {
          health: 50,
          maxHealth: 50,
          attack: 8,
          defense: 3,
          speed: 6,
          experienceReward: 20
        };
        canBeRecruited = false;
        dropRate = 0.4;
        possibleDrops = ['potion_small', 'dagger'];
        break;
      case 'wolf':
        stats = {
          health: 40,
          maxHealth: 40,
          attack: 10,
          defense: 2,
          speed: 8,
          experienceReward: 15
        };
        canBeRecruited = true;
        possibleDrops = ['wolf_fang', 'wolf_pelt'];
        break;
      default:
        // Generic monster stats
        stats = {
          health: 40,
          maxHealth: 40,
          attack: 7,
          defense: 3,
          speed: 5,
          experienceReward: 15
        };
        possibleDrops = ['potion_small'];
    }
    
    const monster = new Monster({
      id,
      name,
      type,
      stats,
      canBeRecruited,
      dropRate,
      possibleDrops
    });
    
    await this.monsterRepository.save(monster);
    return monster;
  }

  async getMonster(id: string): Promise<Monster | null> {
    return await this.monsterRepository.findById(id);
  }

  async getAllMonsters(): Promise<Monster[]> {
    return await this.monsterRepository.findAll();
  }

  async getMonstersByIds(ids: string[]): Promise<Monster[]> {
    return await this.monsterRepository.findByIds(ids);
  }

  async takeDamage(id: string, amount: number): Promise<Monster | null> {
    const monster = await this.monsterRepository.findById(id);
    if (!monster) {
      return null;
    }
    
    monster.takeDamage(amount);
    await this.monsterRepository.update(monster);
    return monster;
  }

  async heal(id: string, amount: number): Promise<Monster | null> {
    const monster = await this.monsterRepository.findById(id);
    if (!monster) {
      return null;
    }
    
    monster.heal(amount);
    await this.monsterRepository.update(monster);
    return monster;
  }

  async attemptRecruitment(id: string, playerLevel: number): Promise<boolean> {
    const monster = await this.monsterRepository.findById(id);
    if (!monster) {
      return false;
    }
    
    return monster.attemptRecruitment(playerLevel);
  }

  async rollForDrop(id: string): Promise<string | null> {
    const monster = await this.monsterRepository.findById(id);
    if (!monster) {
      return null;
    }
    
    return monster.rollForDrop();
  }

  async saveMonster(monster: Monster): Promise<void> {
    await this.monsterRepository.save(monster);
  }
}
