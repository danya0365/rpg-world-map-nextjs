import { Character } from "../entities/Character";
import { Skill, SkillData, SkillType, SkillTarget } from "../entities/Skill";

export interface LevelUpReward {
  statIncreases: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
    mana?: number;
  };
  newSkills: Skill[];
}

export class LevelUpService {
  /**
   * Calculates rewards for a character leveling up
   * @param character The character that leveled up
   * @param previousLevel The character's previous level
   * @param currentLevel The character's new level
   * @returns LevelUpReward containing stat increases and new skills
   */
  public calculateLevelUpRewards(
    character: Character,
    previousLevel: number,
    currentLevel: number
  ): LevelUpReward {
    // Calculate stat increases based on level difference
    const levelDifference = currentLevel - previousLevel;
    
    // Base stat increases per level
    const baseHealthIncrease = 10;
    const baseAttackIncrease = 2;
    const baseDefenseIncrease = 2;
    const baseSpeedIncrease = 1;
    const baseManaIncrease = 5;
    
    // Calculate total stat increases
    const statIncreases = {
      health: baseHealthIncrease * levelDifference,
      attack: baseAttackIncrease * levelDifference,
      defense: baseDefenseIncrease * levelDifference,
      speed: baseSpeedIncrease * levelDifference,
      mana: baseManaIncrease * levelDifference,
    };
    
    // Determine new skills based on new level
    const newSkills: Skill[] = [];
    
    // Check for each level gained if there are new skills
    for (let level = previousLevel + 1; level <= currentLevel; level++) {
      const skillsForThisLevel = this.getNewSkillsForLevel(level);
      newSkills.push(...skillsForThisLevel);
    }
    
    return {
      statIncreases,
      newSkills,
    };
  }
  
  /**
   * Apply level up rewards to a character
   * @param character The character to apply rewards to
   * @param rewards The rewards to apply
   */
  public applyLevelUpRewards(character: Character, rewards: LevelUpReward): void {
    // Apply stat increases - we need to manually apply each stat since Character doesn't have an updateStats method
    
    // Heal the character to full health + the health increase
    character.heal(rewards.statIncreases.health);
    
    // For other stats, we need to modify the internal state directly through the Character class methods
    // Unfortunately, Character doesn't have direct methods to increase max health, attack, defense, etc.
    // We'll need to handle this in the battle end handler instead
    
    // Add new skills to character
    rewards.newSkills.forEach(skill => {
      character.learnSkill(skill.getId());
    });
  }
  
  /**
   * Get new skills that should be unlocked at the given level
   * @param level The level to check for new skills
   * @returns Array of new skills for this level
   */
  private getNewSkillsForLevel(level: number): Skill[] {
    // Define skills available at different levels
    const skillsByLevel: Record<number, SkillData[]> = {
      2: [{
        id: "fireball",
        name: "Fireball",
        description: "Launches a ball of fire at the enemy",
        type: SkillType.ATTACK,
        target: SkillTarget.ENEMY,
        effects: [{ type: "damage", value: 15 }],
        manaCost: 5,
        cooldown: 1,
        requiredLevel: 2
      }],
      3: [{
        id: "heal",
        name: "Heal",
        description: "Restores some health",
        type: SkillType.HEAL,
        target: SkillTarget.SELF,
        effects: [{ type: "heal", value: 20 }],
        manaCost: 10,
        cooldown: 2,
        requiredLevel: 3
      }],
      5: [{
        id: "lightning_strike",
        name: "Lightning Strike",
        description: "Calls down lightning on the enemy",
        type: SkillType.ATTACK,
        target: SkillTarget.ENEMY,
        effects: [{ type: "damage", value: 25 }],
        manaCost: 15,
        cooldown: 3,
        requiredLevel: 5
      }],
      7: [{
        id: "power_strike",
        name: "Power Strike",
        description: "A powerful melee attack",
        type: SkillType.ATTACK,
        target: SkillTarget.ENEMY,
        effects: [{ type: "damage", value: 30 }],
        manaCost: 8,
        cooldown: 2,
        requiredLevel: 7
      }],
      10: [{
        id: "whirlwind",
        name: "Whirlwind",
        description: "Spin and hit all enemies",
        type: SkillType.ATTACK,
        target: SkillTarget.ALL_ENEMIES,
        effects: [{ type: "damage", value: 20 }],
        manaCost: 12,
        cooldown: 3,
        requiredLevel: 10
      }]
    };
    
    // Convert skill data to Skill objects
    const skillDataForLevel = skillsByLevel[level] || [];
    return skillDataForLevel.map(data => new Skill(data));
  }
}
