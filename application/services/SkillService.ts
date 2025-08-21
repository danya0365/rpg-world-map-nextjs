import { Skill } from '../../domain/entities/Skill';
import { Character } from '../../domain/entities/Character';
import { Monster } from '../../domain/entities/Monster';
import { ISkillService, SkillUseResult } from '../../domain/interfaces/ISkillService';
import { DEFAULT_SKILLS } from '../../domain/default-data/skills/DefaultSkills';

export class SkillService implements ISkillService {
  private skills: Map<string, Skill> = new Map();

  constructor() {
    this.initializeSkills();
  }

  private initializeSkills(): void {
    DEFAULT_SKILLS.forEach(skillData => {
      const skill = new Skill(skillData);
      this.skills.set(skill.getId(), skill);
    });
  }

  public getSkillById(skillId: string): Skill | null {
    return this.skills.get(skillId) || null;
  }

  public getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  public getSkillsForCharacter(character: Character): Skill[] {
    // Ensure we have a valid array of skill IDs
    const characterSkillIds = character.getSkills() || [];
    
    // Handle potential undefined/null skills array
    if (!Array.isArray(characterSkillIds)) {
      console.error('Character skills is not an array:', characterSkillIds);
      return [];
    }
    
    return characterSkillIds
      .map(skillId => this.getSkillById(skillId))
      .filter((skill): skill is Skill => skill !== null)
      .filter(skill => skill.canBeUsedByLevel(character.getStats().level));
  }

  public canUseSkill(character: Character, skillId: string): boolean {
    const skill = this.getSkillById(skillId);
    if (!skill) {
      return false;
    }

    // Check if character has the skill
    if (!character.hasSkill(skillId)) {
      return false;
    }

    // Check level requirement
    if (!skill.canBeUsedByLevel(character.getStats().level)) {
      return false;
    }

    // Check mana cost
    if (character.getStats().mana < skill.getManaCost()) {
      return false;
    }

    // Check cooldown
    if (character.isSkillOnCooldown(skillId)) {
      return false;
    }

    return true;
  }

  public useSkill(character: Character, skillId: string, target?: Character | Monster): SkillUseResult {
    const skill = this.getSkillById(skillId);
    if (!skill) {
      return {
        success: false,
        message: 'Skill not found'
      };
    }

    if (!this.canUseSkill(character, skillId)) {
      return {
        success: false,
        message: 'Cannot use this skill right now'
      };
    }

    // Use mana
    if (!character.useMana(skill.getManaCost())) {
      return {
        success: false,
        message: 'Not enough mana'
      };
    }

    // Set cooldown
    character.setSkillCooldown(skillId, skill.getCooldown());

    // Apply skill effects
    const result: SkillUseResult = {
      success: true,
      message: `Used ${skill.getName()}!`
    };

    const effects = skill.getEffects();
    for (const effect of effects) {
      switch (effect.type) {
        case 'damage':
          if (target && 'takeDamage' in target) {
            const damage = this.calculateDamage(character, effect.value);
            target.takeDamage(damage);
            result.damage = damage;
            result.message += ` Dealt ${damage} damage!`;
          }
          break;

        case 'heal':
          const healing = effect.value;
          character.heal(healing);
          result.healing = healing;
          result.message += ` Restored ${healing} HP!`;
          break;

        case 'buff_attack':
          // For now, we'll just add a temporary attack boost
          // In a more complete implementation, we'd have a buff system
          result.buffApplied = true;
          result.message += ` Attack increased!`;
          break;

        case 'buff_defense':
          result.buffApplied = true;
          result.message += ` Defense increased!`;
          break;

        case 'debuff_attack':
          if (target) {
            result.debuffApplied = true;
            result.message += ` Enemy attack decreased!`;
          }
          break;

        case 'debuff_defense':
          if (target) {
            result.debuffApplied = true;
            result.message += ` Enemy defense decreased!`;
          }
          break;
      }
    }

    return result;
  }

  public getSkillsByLevel(level: number): Skill[] {
    return this.getAllSkills().filter(skill => skill.getRequiredLevel() <= level);
  }

  private calculateDamage(character: Character, baseDamage: number): number {
    const stats = character.getStats();
    // Add some character attack power to the base damage
    const damage = baseDamage + Math.floor(stats.attack * 0.5);
    
    // Add some randomness (±20%)
    const randomMultiplier = 0.8 + Math.random() * 0.4;
    
    return Math.floor(damage * randomMultiplier);
  }
}
