import React, { useState, useEffect } from 'react';
import { BattleResult } from '../../../../domain/interfaces/IBattleService';
import { ISoundService } from '../../../../domain/interfaces/ISoundService';
import { LevelUpReward } from '../../../../domain/services/LevelUpService';
import LevelUpModal from './LevelUpModal';

interface BattleResultProps {
  result: BattleResult;
  battleSummary: {
    damageDealt: number;
    damageTaken: number;
    turnsElapsed: number;
    criticalHits: number;
    itemsUsed: number;
  };
  showDetailedResults: boolean;
  onBattleEnd: (result: BattleResult) => void;
  soundService: ISoundService;
  // Add battle log to detect flee
  battleLog?: string[];
  // Add level up information
  leveledUp?: boolean;
  previousLevel?: number;
  currentLevel?: number;
  levelUpRewards?: LevelUpReward;
}

const BattleResultComponent: React.FC<BattleResultProps> = ({ 
  result, 
  battleSummary, 
  showDetailedResults,
  onBattleEnd,
  soundService,
  battleLog = [],
  leveledUp = false,
  previousLevel = 1,
  currentLevel = 1,
  levelUpRewards
}) => {
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  
  // Default level up rewards if not provided
  const defaultLevelUpRewards: LevelUpReward = {
    statIncreases: {
      health: 10,
      attack: 2,
      defense: 2,
      speed: 1,
      mana: 5
    },
    newSkills: []
  };
  
  useEffect(() => {
    if (leveledUp) {
      // Show level up modal with a slight delay
      const timer = setTimeout(() => {
        setShowLevelUpModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [leveledUp]);
  // Add null check to prevent destructuring errors
  if (!result) {
    console.error('Battle result is null or undefined');
    // Provide default values
    return (
      <div className="bg-slate-900/90 p-6 rounded-lg border-2 border-amber-500/50 mb-6 text-center">
        <h3 className="text-2xl font-kanit font-bold text-center mb-4">
          <span className="text-yellow-400">Battle Ended</span>
        </h3>
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              soundService.playSound('menu-close', 0.5).catch(err => {
                console.warn('Failed to play menu close sound:', err);
              });
              onBattleEnd({
                victory: false,
                experienceGained: 0,
                itemDropped: null,
                monsterRecruited: null
              });
            }}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  const { victory, experienceGained, itemDropped, monsterRecruited } = result;
  
  return (
    <div className="bg-slate-900/90 p-6 rounded-lg border-2 border-amber-500/50 mb-6">
      <h3 className="text-2xl font-kanit font-bold text-center mb-4">
        {victory ? (
          <span className="text-green-400">🎉 Victory! 🎉</span>
        ) : battleLog.some(log => log.includes('fled from battle')) ? (
          <span className="text-amber-400">🏃 Escaped Successfully 🏃</span>
        ) : (
          <span className="text-red-400">💀 Defeat 💀</span>
        )}
      </h3>
      
      <div className="space-y-3 text-center">
        {victory && (
          <>
            <div className="text-blue-400">
              <span className="text-yellow-400">⭐</span> Experience Gained: {experienceGained}
            </div>
            
            {leveledUp && (
              <div className="text-yellow-400 font-bold transition-all duration-500 my-2">
                <span className="text-yellow-400">🌟</span> LEVEL UP! <span className="text-yellow-400">🌟</span>
                <div className="text-green-400 text-lg">
                  Level {previousLevel} → Level {currentLevel}
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  Your stats have increased!
                </div>
              </div>
            )}
            
            {itemDropped && (
              <div className="text-green-400">
                <span className="text-yellow-400">💎</span> Item Found: {itemDropped.getName()}
              </div>
            )}
            
            {monsterRecruited && (
              <div className="text-purple-400">
                <span className="text-yellow-400">🤝</span> {monsterRecruited.getName()} joined your party!
              </div>
            )}
          </>
        )}
      </div>
      
      {showDetailedResults && (
        <div className="mt-4 pt-4 border-t border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">Battle Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-300">Damage Dealt: <span className="text-red-400">{battleSummary.damageDealt}</span></div>
            <div className="text-slate-300">Damage Taken: <span className="text-red-400">{battleSummary.damageTaken}</span></div>
            <div className="text-slate-300">Turns: <span className="text-blue-400">{battleSummary.turnsElapsed}</span></div>
            <div className="text-slate-300">Critical Hits: <span className="text-yellow-400">{battleSummary.criticalHits}</span></div>
          </div>
        </div>
      )}
      
      {/* Add confirmation button to return to map */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            soundService.playSound('menu-close', 0.5).catch(err => {
              console.warn('Failed to play menu close sound:', err);
            });
            onBattleEnd(result);
          }}
          className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Continue
        </button>
      </div>
      
      {/* Level Up Modal */}
      {showLevelUpModal && leveledUp && (
        <LevelUpModal
          previousLevel={previousLevel}
          currentLevel={currentLevel}
          rewards={levelUpRewards || defaultLevelUpRewards}
          onClose={() => setShowLevelUpModal(false)}
          soundService={soundService}
        />
      )}
    </div>
  );
};

export default BattleResultComponent;
