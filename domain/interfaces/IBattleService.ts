import { Character } from '../entities/Character';
import { Monster } from '../entities/Monster';
import { Item } from '../entities/Item';
import { LevelUpReward } from '../services/LevelUpService';

export interface BattleResult {
  victory: boolean;
  experienceGained: number;
  itemDropped: Item | null;
  monsterRecruited: Monster | null;
}

export interface BattleState {
  character: Character;
  monster: Monster;
  turn: 'character' | 'monster';
  log: string[];
  isOver: boolean;
  result: BattleResult | null;
  // Level up information
  leveledUp?: boolean;
  previousLevel?: number;
  currentLevel?: number;
  levelUpRewards?: LevelUpReward;
}

export interface IBattleService {
  initiateBattle(characterId: string, monsterId: string): Promise<BattleState>;
  performCharacterAction(battleState: BattleState, action: 'attack' | 'defend' | 'flee'): Promise<BattleState>;
  performMonsterAction(battleState: BattleState): Promise<BattleState>;
  attemptRecruitment(battleState: BattleState): Promise<boolean>;
  endBattle(battleState: BattleState): Promise<BattleResult>;
}
