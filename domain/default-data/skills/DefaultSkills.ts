import { SkillData, SkillType, SkillTarget } from '../../entities/Skill';

export const DEFAULT_SKILLS: SkillData[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    description: 'Launch a powerful fireball that deals fire damage to an enemy',
    type: SkillType.ATTACK,
    target: SkillTarget.ENEMY,
    effects: [
      {
        type: 'damage',
        value: 25
      }
    ],
    manaCost: 10,
    cooldown: 2,
    requiredLevel: 3,
    icon: '🔥'
  },
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restore health to yourself',
    type: SkillType.HEAL,
    target: SkillTarget.SELF,
    effects: [
      {
        type: 'heal',
        value: 30
      }
    ],
    manaCost: 8,
    cooldown: 3,
    requiredLevel: 2,
    icon: '💚'
  },
  {
    id: 'power_strike',
    name: 'Power Strike',
    description: 'A devastating attack that deals massive damage',
    type: SkillType.ATTACK,
    target: SkillTarget.ENEMY,
    effects: [
      {
        type: 'damage',
        value: 40
      }
    ],
    manaCost: 15,
    cooldown: 4,
    requiredLevel: 5,
    icon: '⚔️'
  },
  {
    id: 'battle_cry',
    name: 'Battle Cry',
    description: 'Boost your attack power for several turns',
    type: SkillType.BUFF,
    target: SkillTarget.SELF,
    effects: [
      {
        type: 'buff_attack',
        value: 10,
        duration: 3
      }
    ],
    manaCost: 12,
    cooldown: 5,
    requiredLevel: 4,
    icon: '📢'
  },
  {
    id: 'ice_shard',
    name: 'Ice Shard',
    description: 'Launch sharp ice that damages and slows the enemy',
    type: SkillType.ATTACK,
    target: SkillTarget.ENEMY,
    effects: [
      {
        type: 'damage',
        value: 20
      },
      {
        type: 'debuff_attack',
        value: 5,
        duration: 2
      }
    ],
    manaCost: 12,
    cooldown: 3,
    requiredLevel: 6,
    icon: '❄️'
  },
  {
    id: 'shield_up',
    name: 'Shield Up',
    description: 'Increase your defense for several turns',
    type: SkillType.BUFF,
    target: SkillTarget.SELF,
    effects: [
      {
        type: 'buff_defense',
        value: 8,
        duration: 4
      }
    ],
    manaCost: 10,
    cooldown: 4,
    requiredLevel: 3,
    icon: '🛡️'
  }
];
