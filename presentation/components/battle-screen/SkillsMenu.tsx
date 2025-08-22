import React from 'react';
import { Skill } from '../../../domain/entities/Skill';
import { Character } from '../../../domain/entities/Character';

interface SkillsMenuProps {
  skills: Skill[];
  character: Character;
  onSkillSelect: (skillId: string) => void;
  onClose: () => void;
  isProcessing: boolean;
}

const SkillsMenu: React.FC<SkillsMenuProps> = ({
  skills,
  character,
  onSkillSelect,
  onClose,
  isProcessing
}) => {
  const characterStats = character.getStats();

  const canUseSkill = (skill: Skill): boolean => {
    return (
      characterStats.mana >= skill.getManaCost() &&
      !character.isSkillOnCooldown(skill.getId()) &&
      skill.canBeUsedByLevel(characterStats.level)
    );
  };

  const getSkillStatusText = (skill: Skill): string => {
    if (characterStats.mana < skill.getManaCost()) {
      return `Need ${skill.getManaCost()} mana (have ${characterStats.mana})`;
    }
    if (character.isSkillOnCooldown(skill.getId())) {
      const cooldown = character.getSkillCooldown(skill.getId());
      return `Cooldown: ${cooldown} turns`;
    }
    if (!skill.canBeUsedByLevel(characterStats.level)) {
      return `Requires level ${skill.getRequiredLevel()}`;
    }
    return `Costs ${skill.getManaCost()} mana`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-kanit font-bold text-amber-400">✨ Special Skills</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-amber-700/30">
          <div className="text-sm text-slate-300">
            <div className="flex justify-between">
              <span>Mana:</span>
              <span className="text-blue-400">{characterStats.mana}/{characterStats.maxMana}</span>
            </div>
          </div>
        </div>

        {skills.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p>No skills learned yet.</p>
            <p className="text-sm mt-2">Skills are learned as you level up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => {
              const canUse = canUseSkill(skill);
              const statusText = getSkillStatusText(skill);
              
              return (
                <div
                  key={skill.getId()}
                  className={`p-4 rounded-lg border transition-all ${
                    canUse
                      ? 'border-amber-500/50 bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer'
                      : 'border-gray-600/50 bg-slate-800/30 opacity-60'
                  }`}
                  onClick={() => canUse && !isProcessing && onSkillSelect(skill.getId())}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{skill.getIcon()}</span>
                      <h4 className="font-kanit font-semibold text-amber-300">
                        {skill.getName()}
                      </h4>
                    </div>
                    <div className="text-right text-xs">
                      <div className={`${canUse ? 'text-green-400' : 'text-red-400'}`}>
                        {statusText}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-2">
                    {skill.getDescription()}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded">
                      {skill.getType()}
                    </span>
                    <span className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded">
                      Target: {skill.getTarget()}
                    </span>
                    {skill.getCooldown() > 0 && (
                      <span className="px-2 py-1 bg-orange-600/30 text-orange-300 rounded">
                        Cooldown: {skill.getCooldown()}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-slate-400">
                    Effects: {skill.getEffects().map(effect => 
                      `${effect.type} ${effect.value}${effect.duration ? ` (${effect.duration} turns)` : ''}`
                    ).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={isProcessing}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsMenu;
