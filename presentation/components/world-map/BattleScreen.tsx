import React from 'react';
import { BattleState, BattleResult } from '../../../domain/interfaces/IBattleService';
import SkillsMenu from './SkillsMenu';
import { useBattleState } from '../../hooks/useBattleState';
import { useBattleActions } from '../../hooks/useBattleActions';
import { useBattleSound } from '../../hooks/useBattleSound';
import CharacterStats from './battle-ui/CharacterStats';
import MonsterStats from './battle-ui/MonsterStats';
import BattleLog from './battle-ui/BattleLog';
import BattleResultComponent from './battle-ui/BattleResult';
import BattleActions from './battle-ui/BattleActions';

interface BattleScreenProps {
  battleState: BattleState;
  onBattleEnd: (result: BattleResult) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ battleState: initialBattleState, onBattleEnd }) => {
  // Use the battle state hook to manage battle state and statistics
  const {
    battleState,
    setBattleState,
    isProcessing,
    setIsProcessing,
    availableSkills,
    showSkillsMenu,
    setShowSkillsMenu,
    showDetailedResults,
    battleSummary,
    turnCount,
    setTurnCount,
    damageDealt,
    setDamageDealt,
    damageTaken,
    setDamageTaken,
    criticalHits,
    setCriticalHits,
    itemsUsed,
    skillService,
    soundService
  } = useBattleState(initialBattleState);
  
  // Use the battle sound hook for UI sound effects
  const {
    playMenuOpenSound,
    playMenuCloseSound,
    playButtonSound
  } = useBattleSound({
    soundService,
    battleState
  });
  
  // Use the battle actions hook for handling battle actions
  const {
    handleAction,
    handleSkillAction,
    handleFlee
  } = useBattleActions({
    battleState,
    setBattleState,
    isProcessing,
    setIsProcessing,
    setShowSkillsMenu,
    setTurnCount,
    setDamageDealt,
    setDamageTaken,
    setCriticalHits,
    soundService,
    skillService,
    onBattleEnd
  });
  
  // Handle opening skills menu
  const handleSkillsOpen = () => {
    setShowSkillsMenu(true);
    playMenuOpenSound();
  };
  
  // Handle closing skills menu
  const handleSkillsClose = () => {
    setShowSkillsMenu(false);
    playMenuCloseSound();
  };
  
  // Handle skill selection
  const handleSkillSelect = (skillId: string) => {
    handleSkillsClose();
    handleSkillAction(skillId);
  };
  
  // Handle battle end confirmation
  const handleBattleEnd = () => {
    playMenuCloseSound();
    if (battleState.result) {
      onBattleEnd(battleState.result);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6 font-kanit">
      <h2 className="text-3xl font-kanit font-bold mb-6 text-center text-amber-400 border-b-2 border-amber-500/50 pb-3">⚔️ Battle ⚔️</h2>
      
      {/* Battle Log Component */}
      <BattleLog 
        log={battleState.log} 
        isProcessing={isProcessing} 
      />
      
      {/* Character and Monster Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="transform transition-all hover:scale-105 duration-300">
          <CharacterStats character={battleState.character} />
        </div>
        <div className="transform transition-all hover:scale-105 duration-300">
          <MonsterStats monster={battleState.monster} />
        </div>
      </div>
      
      {/* Battle Result or Battle Actions */}
      {battleState.isOver ? (
        <BattleResultComponent 
          result={battleState.result!}
          battleSummary={battleSummary}
          showDetailedResults={showDetailedResults}
          onBattleEnd={handleBattleEnd}
          soundService={soundService}
          battleLog={battleState.log}
        />
      ) : (
        <BattleActions 
          isProcessing={isProcessing}
          availableSkills={availableSkills}
          onAttack={() => handleAction('attack')}
          onDefend={() => handleAction('defend')}
          onSkillsOpen={handleSkillsOpen}
          onFlee={handleFlee}
          soundService={soundService}
        />
      )}

      {/* Skills Menu */}
      {showSkillsMenu && (
        <SkillsMenu
          skills={availableSkills}
          character={battleState.character}
          onSkillSelect={handleSkillSelect}
          onClose={handleSkillsClose}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default BattleScreen;
