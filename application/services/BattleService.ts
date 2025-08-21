import { Monster } from '../../domain/entities/Monster';
import { Item } from '../../domain/entities/Item';
import { BattleResult, BattleState, IBattleService } from '../../domain/interfaces/IBattleService';
import { ICharacterService } from '../../domain/interfaces/ICharacterService';
import { IMonsterService } from '../../domain/interfaces/IMonsterService';
import { IItemService } from '../../domain/interfaces/IItemService';

export class BattleService implements IBattleService {
  constructor(
    private characterService: ICharacterService,
    private monsterService: IMonsterService,
    private itemService: IItemService
  ) {}

  async initiateBattle(characterId: string, monsterId: string): Promise<BattleState> {
    const character = await this.characterService.getCharacter(characterId);
    const monster = await this.monsterService.getMonster(monsterId);
    
    if (!character || !monster) {
      throw new Error('Character or monster not found');
    }
    
    // Determine who goes first based on speed
    const characterStats = character.getStats();
    const monsterStats = monster.getStats();
    
    const turn = characterStats.speed >= monsterStats.speed ? 'character' : 'monster';
    
    return {
      character,
      monster,
      turn,
      log: [`Battle started between ${character.getName()} and ${monster.getName()}`],
      isOver: false,
      result: null
    };
  }

  async performCharacterAction(battleState: BattleState, action: 'attack' | 'defend' | 'flee'): Promise<BattleState> {
    if (battleState.isOver) {
      return battleState;
    }
    
    const { character, monster, log } = battleState;
    const newLog = [...log];
    
    switch (action) {
      case 'attack':
        const characterStats = character.getStats();
        const damage = Math.max(1, characterStats.attack - monster.getStats().defense / 2);
        
        monster.takeDamage(damage);
        newLog.push(`${character.getName()} attacks ${monster.getName()} for ${damage} damage`);
        
        if (monster.isDefeated()) {
          // Monster is defeated, end the battle
          const updatedState = {
            ...battleState,
            log: newLog,
            isOver: true
          };
          
          // Get the battle result
          const result = await this.endBattle(updatedState);
          
          // Return the updated battle state with the result
          return {
            ...updatedState,
            result
          };
        }
        break;
        
      case 'defend':
        // Defending reduces damage taken in the next turn and recovers a small amount of health
        character.heal(5);
        newLog.push(`${character.getName()} defends and recovers 5 health`);
        break;
        
      case 'flee':
        // 50% chance to flee
        if (Math.random() > 0.5) {
          newLog.push(`${character.getName()} successfully fled from battle`);
          return {
            ...battleState,
            log: newLog,
            isOver: true,
            result: {
              victory: false,
              experienceGained: 0,
              itemDropped: null,
              monsterRecruited: null
            }
          };
        } else {
          newLog.push(`${character.getName()} failed to flee`);
        }
        break;
    }
    
    // Switch turn to monster
    return {
      ...battleState,
      log: newLog,
      turn: 'monster'
    };
  }

  async performMonsterAction(battleState: BattleState): Promise<BattleState> {
    if (battleState.isOver) {
      return battleState;
    }
    
    const { character, monster, log } = battleState;
    const newLog = [...log];
    
    // Monster always attacks
    const monsterStats = monster.getStats();
    const damage = Math.max(1, monsterStats.attack - character.getStats().defense / 2);
    
    character.takeDamage(damage);
    newLog.push(`${monster.getName()} attacks ${character.getName()} for ${damage} damage`);
    
    if (character.isDefeated()) {
      newLog.push(`${character.getName()} has been defeated!`);
      return {
        ...battleState,
        log: newLog,
        isOver: true,
        result: {
          victory: false,
          experienceGained: 0,
          itemDropped: null,
          monsterRecruited: null
        }
      };
    }
    
    // Switch turn back to character
    return {
      ...battleState,
      log: newLog,
      turn: 'character'
    };
  }

  async attemptRecruitment(battleState: BattleState): Promise<boolean> {
    const { character, monster } = battleState;
    
    if (!monster.isDefeated() || !monster.isRecruitmentPossible()) {
      return false;
    }
    
    const characterStats = character.getStats();
    const success = monster.attemptRecruitment(characterStats.level);
    
    if (success) {
      character.addAlly(monster.getId());
      await this.characterService.saveCharacter(character);
    }
    
    return success;
  }

  async endBattle(battleState: BattleState): Promise<BattleResult> {
    const { character, monster, log } = battleState;
    const newLog = [...log];
    
    if (monster.isDefeated()) {
      // Character won
      const experienceGained = monster.getExperienceReward();
      character.addExperience(experienceGained);
      newLog.push(`${monster.getName()} has been defeated!`);
      newLog.push(`${character.getName()} gained ${experienceGained} experience`);
      
      // Check for level up
      const oldLevel = character.getStats().level;
      const newLevel = character.getStats().level;
      if (newLevel > oldLevel) {
        newLog.push(`${character.getName()} leveled up to level ${newLevel}!`);
      }
      
      // Check for item drop
      const droppedItemId = monster.rollForDrop();
      let droppedItem: Item | null = null;
      
      if (droppedItemId) {
        droppedItem = await this.itemService.getItem(droppedItemId);
        if (droppedItem) {
          character.addItem(droppedItemId);
          newLog.push(`${monster.getName()} dropped a ${droppedItem.getName()}!`);
        }
      }
      
      // Check for monster recruitment
      let recruitedMonster: Monster | null = null;
      const recruitment = await this.attemptRecruitment(battleState);
      
      if (recruitment) {
        recruitedMonster = monster;
        newLog.push(`${monster.getName()} has joined your party!`);
      }
      
      // Save character changes
      await this.characterService.saveCharacter(character);
      
      const result: BattleResult = {
        victory: true,
        experienceGained,
        itemDropped: droppedItem,
        monsterRecruited: recruitedMonster
      };
      
      // Update the battle state (but we return only the result)
      battleState.log = newLog;
      battleState.isOver = true;
      battleState.result = result;
      
      return result;
    }
    
    // This shouldn't happen normally, but just in case
    const result: BattleResult = {
      victory: false,
      experienceGained: 0,
      itemDropped: null,
      monsterRecruited: null
    };
    
    // Update the battle state (but we return only the result)
    battleState.log = newLog;
    battleState.isOver = true;
    battleState.result = result;
    
    return result;
  }
}
