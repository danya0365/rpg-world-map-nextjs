import React from 'react';
import { Skill } from '../../../../domain/entities/Skill';
import { ISoundService } from '../../../../domain/interfaces/ISoundService';

interface BattleActionsProps {
  isProcessing: boolean;
  availableSkills: Skill[];
  onAttack: () => void;
  onDefend: () => void;
  onSkillsOpen: () => void;
  onFlee: () => void;
  soundService: ISoundService;
}

const BattleActions: React.FC<BattleActionsProps> = ({
  isProcessing,
  availableSkills,
  onAttack,
  onDefend,
  onSkillsOpen,
  onFlee,
  soundService
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <button
        onClick={onAttack}
        disabled={isProcessing}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ⚔️ Attack
      </button>
      <button
        onClick={onDefend}
        disabled={isProcessing}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🛡️ Defend
      </button>
      <button
        onClick={() => {
          onSkillsOpen();
          soundService.playSound('menu-open', 0.4).catch(err => {
            console.warn('Failed to play menu open sound:', err);
          });
        }}
        disabled={isProcessing || availableSkills.length === 0}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ✨ Skills ({availableSkills.length})
      </button>
      <button
        onClick={onFlee}
        disabled={isProcessing}
        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🏃 Flee
      </button>
    </div>
  );
};

export default BattleActions;
