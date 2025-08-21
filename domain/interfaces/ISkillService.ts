import { Skill } from '../entities/Skill';
import { Character } from '../entities/Character';
import { Monster } from '../entities/Monster';

export interface SkillUseResult {
  success: boolean;
  message: string;
  damage?: number;
  healing?: number;
  buffApplied?: boolean;
  debuffApplied?: boolean;
}

export interface ISkillService {
  getSkillById(skillId: string): Skill | null;
  getAllSkills(): Skill[];
  getSkillsForCharacter(character: Character): Skill[];
  canUseSkill(character: Character, skillId: string): boolean;
  useSkill(character: Character, skillId: string, target?: Character | Monster): SkillUseResult;
  getSkillsByLevel(level: number): Skill[];
}
