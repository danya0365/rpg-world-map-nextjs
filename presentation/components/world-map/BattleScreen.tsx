import React, { useState, useEffect } from 'react';
import { IBattleService, BattleState, BattleResult } from '../../../domain/interfaces/IBattleService';
import { ISkillService } from '../../../domain/interfaces/ISkillService';
import { ISoundService } from '../../../domain/interfaces/ISoundService';
import { Skill } from '../../../domain/entities/Skill';
import { getContainer } from '../../../infrastructure/config/DIContainer';
import SkillsMenu from './SkillsMenu';

interface BattleScreenProps {
  battleState: BattleState;
  onBattleEnd: (result: BattleResult) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ battleState: initialBattleState, onBattleEnd }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [showSkillsMenu, setShowSkillsMenu] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [battleSummary, setBattleSummary] = useState<{
    damageDealt: number;
    damageTaken: number;
    turnsElapsed: number;
    criticalHits: number;
    itemsUsed: number;
  }>({ damageDealt: 0, damageTaken: 0, turnsElapsed: 0, criticalHits: 0, itemsUsed: 0 });
  
  // Get services from DI container
  const battleService = getContainer().resolve<IBattleService>('BattleService');
  const skillService = getContainer().resolve<ISkillService>('SkillService');
  const soundService = getContainer().resolve<ISoundService>('SoundService');

  // Track battle statistics for detailed results
  const [turnCount, setTurnCount] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [criticalHits, setCriticalHits] = useState(0);
  
  // Track items used in battle
  const [itemsUsed] = useState<{id: string, name: string}[]>([]);
  
  // Initialize battle state with character's turn
  const [battleState, setBattleState] = useState<BattleState>({
    ...initialBattleState,
    turn: 'character' // Always ensure player starts first
  });

  // Reset battle state when initialBattleState changes (new battle starts)
  useEffect(() => {
    // Reset battle state with character's turn when a new battle starts
    setBattleState({
      ...initialBattleState,
      turn: 'character'
    });
    
    // Reset battle statistics
    setTurnCount(0);
    setDamageDealt(0);
    setDamageTaken(0);
    setCriticalHits(0);
    setShowDetailedResults(false);
    
  }, [initialBattleState]);
  
  // Initialize battle state and load available skills
  useEffect(() => {
    // Load available skills for the character
    const skills = skillService.getSkillsForCharacter(battleState.character);
    setAvailableSkills(skills);
    
    // Play battle music when component mounts
    soundService.playMusic('battle-music', true, 0.4).catch(err => {
      console.warn('Failed to play battle music:', err);
    });
    
    // Stop battle music when component unmounts
    return () => {
      soundService.stopSound('battle-music');
    };
  }, [battleState, skillService, soundService]);

  useEffect(() => {
    if (battleState.isOver && battleState.result) {
      // When battle ends, prepare detailed statistics
      setBattleSummary({
        damageDealt,
        damageTaken,
        turnsElapsed: turnCount,
        criticalHits,
        itemsUsed: itemsUsed.length
      });
      
      // Show detailed results when battle is over
      setShowDetailedResults(true);
      
      // Play victory or defeat sound
      if (battleState.result.victory) {
        soundService.playSound('victory', 0.7).catch(err => {
          console.warn('Failed to play victory sound:', err);
        });
      } else {
        soundService.playSound('defeat', 0.7).catch(err => {
          console.warn('Failed to play defeat sound:', err);
        });
      }
      
      // Stop battle music
      soundService.stopSound('battle-music');
      
      // NOTE: We no longer automatically call onBattleEnd here
      // The user must click the confirmation button to end the battle
    }
  }, [battleState.isOver, battleState.result, battleState.character, damageDealt, damageTaken, turnCount, criticalHits, itemsUsed.length, soundService]);

  const handleSkillAction = async (skillId: string) => {
    console.log(`🎯 [BATTLE] handleSkillAction called with skill: ${skillId}`);
    
    if (isProcessing || battleState.isOver) {
      console.log(`🚫 [BATTLE] Skill action blocked - isProcessing: ${isProcessing}, isOver: ${battleState.isOver}`);
      return;
    }

    try {
      setIsProcessing(true);
      setShowSkillsMenu(false);
      setTurnCount(prev => prev + 1);

      console.log(`🎮 [BATTLE] Using skill: ${skillId}`);
      
      // Play skill sound
      soundService.playSound('skill', 0.6).catch(err => {
        console.warn('Failed to play skill sound:', err);
      });
      
      // Use skill on the monster
      const skillResult = skillService.useSkill(battleState.character, skillId, battleState.monster);
      
      if (!skillResult.success) {
        console.log(`❌ [BATTLE] Skill use failed: ${skillResult.message}`);
        setIsProcessing(false);
        return;
      }

      console.log(`✅ [BATTLE] Skill used successfully: ${skillResult.message}`);
      
      // Update battle state after skill use
      const updatedState = { ...battleState };
      setBattleState(updatedState);

      // Track damage if any
      if (skillResult.damage) {
        setDamageDealt(prev => prev + skillResult.damage!);
      }

      // Check if monster is defeated after skill
      if (battleState.monster.isDefeated()) {
        console.log(`🏆 [BATTLE] Monster defeated by skill!`);
        const result = await battleService.endBattle(updatedState);
        // Don't automatically call onBattleEnd here
        // Update the battle state with the result instead
        setBattleState({
          ...updatedState,
          isOver: true,
          result: result
        });
        setIsProcessing(false);
        return;
      }
      
      // Play monster attack sound with delay
      setTimeout(() => {
        soundService.playSound('monster-attack', 0.5).catch(err => {
          console.warn('Failed to play monster attack sound:', err);
        });
      }, 1000);

      // Monster's turn after skill
      console.log(`👹 [BATTLE] Monster turn after skill...`);
      setTimeout(async () => {
        try {
          const monsterState = await battleService.performMonsterAction(updatedState);
          console.log(`✅ [BATTLE] Monster action completed after skill`);
          
          setBattleState(monsterState);
          
          // Don't automatically call onBattleEnd here
          // The battle result screen will be shown and user must click Continue
          
          setIsProcessing(false);
        } catch (error) {
          console.error('❌ [BATTLE] Monster action error after skill:', error);
          setIsProcessing(false);
        }
      }, 1500);

    } catch (error) {
      console.error('❌ [BATTLE] Skill action error:', error);
      setIsProcessing(false);
    }
  };

  const handleAction = async (action: 'attack' | 'defend' | 'flee') => {
    console.log(`🎯 [BATTLE] handleAction called with action: ${action}`);
    console.log(`🎯 [BATTLE] Current state - isProcessing: ${isProcessing}, isOver: ${battleState.isOver}`);
    console.log(`🎯 [BATTLE] Current turn: ${battleState.turn}`);
    
    if (isProcessing || battleState.isOver) {
      console.log(`🚫 [BATTLE] Action blocked - isProcessing: ${isProcessing}, isOver: ${battleState.isOver}`);
      return;
    }
    
    try {
      console.log(`⚡ [BATTLE] Setting isProcessing to true`);
      setIsProcessing(true);
      setTurnCount(prev => prev + 1);
      
      console.log(`🎮 [BATTLE] Performing character action: ${action}`);
      
      // Play appropriate sound for the action
      switch (action) {
        case 'attack':
          soundService.playSound('attack', 0.6).catch(err => {
            console.warn('Failed to play attack sound:', err);
          });
          break;
        case 'defend':
          soundService.playSound('defend', 0.6).catch(err => {
            console.warn('Failed to play defend sound:', err);
          });
          break;
        case 'flee':
          // Handle flee separately
          handleFlee();
          return;
      }
      
      // Perform the character action
      const updatedState = await battleService.performCharacterAction(battleState, action);
      
      // Track damage dealt to monster
      const previousMonsterHealth = battleState.monster.getStats().health;
      const currentMonsterHealth = updatedState.monster.getStats().health;
      const damageToMonster = previousMonsterHealth - currentMonsterHealth;
      
      if (damageToMonster > 0) {
        setDamageDealt(prev => prev + damageToMonster);
        console.log(`💥 [BATTLE] Damage dealt to monster: ${damageToMonster}`);
        
        // Check for critical hit (simplified logic)
        if (damageToMonster > 15) {
          setCriticalHits(prev => prev + 1);
          console.log(`🎯 [BATTLE] Critical hit detected!`);
          
          // Play critical hit sound
          soundService.playSound('critical-hit', 0.7).catch(err => {
            console.warn('Failed to play critical hit sound:', err);
          });
        }
      }
      
      // Update battle state with character's action result
      setBattleState(updatedState);
      
      // If battle is over, don't proceed to monster turn
      if (updatedState.isOver) {
        console.log(`🏁 [BATTLE] Battle is over, not proceeding to monster turn`);
        // Don't automatically call onBattleEnd here
        // Let the user click the confirmation button instead
        setIsProcessing(false);
        return;
      }
      
      // Monster's turn
      console.log(`👹 [BATTLE] Starting monster turn...`);
      setTimeout(async () => {
        // Play monster attack sound
        soundService.playSound('monster-attack', 0.5).catch(err => {
          console.warn('Failed to play monster attack sound:', err);
        });
        try {
          console.log(`👹 [BATTLE] Executing monster action`);
          const monsterState = await battleService.performMonsterAction(updatedState);
          console.log(`✅ [BATTLE] Monster action completed. Final state:`, {
            turn: monsterState.turn,
            isOver: monsterState.isOver,
            characterHealth: monsterState.character.getStats().health,
            monsterHealth: monsterState.monster.getStats().health
          });
          
          // Track damage taken
          const previousCharacterHealth = updatedState.character.getStats().health;
          const currentCharacterHealth = monsterState.character.getStats().health;
          const damageToCharacter = previousCharacterHealth - currentCharacterHealth;
          
          if (damageToCharacter > 0) {
            setDamageTaken(prev => prev + damageToCharacter);
            console.log(`💔 [BATTLE] Damage taken by character: ${damageToCharacter}`);
          }
          
          setBattleState(monsterState);
          
          if (monsterState.isOver && monsterState.result) {
            console.log(`🏁 [BATTLE] Battle ended with result:`, monsterState.result);
            // Don't automatically call onBattleEnd here
            // The battle result screen will be shown and user must click Continue
          }
          
          console.log(`⚡ [BATTLE] Setting isProcessing to false`);
          setIsProcessing(false);
        } catch (error) {
          console.error('❌ [BATTLE] Monster action error:', error);
          if (error instanceof Error) {
            console.error('❌ [BATTLE] Error stack:', error.stack);
          }
          setIsProcessing(false);
        }
      }, 1500);
      
    } catch (error) {
      console.error('❌ [BATTLE] Character action error:', error);
      if (error instanceof Error) {
        console.error('❌ [BATTLE] Error stack:', error.stack);
      }
      setIsProcessing(false);
    }
  };

  const handleFlee = () => {
    // Set processing to prevent further actions
    setIsProcessing(true);
    // Directly handle flee without going through monster turn
    battleService.performCharacterAction(battleState, 'flee')
      .then(updatedState => {
        // Mark battle as over immediately and ensure turn is set to character
        const fleeState: BattleState = {
          ...updatedState,
          isOver: true,
          turn: 'character' // Reset turn to character for next battle
        };
        setBattleState(fleeState);
        setIsProcessing(false);
        // Small delay before ending battle
        setTimeout(() => {
          onBattleEnd({
            victory: false,
            experienceGained: 0,
            itemDropped: null,
            monsterRecruited: null
          });
        }, 500);
      });
  };

  const renderCharacterStats = () => {
    const stats = battleState.character.getStats();
    const healthPercentage = (stats.health / stats.maxHealth) * 100;
    const manaPercentage = (stats.mana / stats.maxMana) * 100;
    
    return (
      <div className="bg-slate-900/80 p-4 rounded-lg border border-amber-500/50 shadow-lg">
        <h3 className="text-lg font-kanit font-bold text-amber-400 mb-3 text-center">
          🛡️ {battleState.character.getName()}
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Health</span>
              <span className="text-red-400">{stats.health}/{stats.maxHealth}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Mana</span>
              <span className="text-blue-400">{stats.mana}/{stats.maxMana}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${manaPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-300">
              <span className="text-orange-400">⚔️</span> Attack: {stats.attack}
            </div>
            <div className="text-slate-300">
              <span className="text-blue-400">🛡️</span> Defense: {stats.defense}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonsterStats = () => {
    const stats = battleState.monster.getStats();
    const healthPercentage = (stats.health / stats.maxHealth) * 100;
    
    return (
      <div className="bg-slate-900/80 p-4 rounded-lg border border-red-500/50 shadow-lg">
        <h3 className="text-lg font-kanit font-bold text-red-400 mb-3 text-center">
          👹 {battleState.monster.getName()}
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Health</span>
              <span className="text-red-400">{stats.health}/{stats.maxHealth}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-300">
              <span className="text-orange-400">⚔️</span> Attack: {stats.attack}
            </div>
            <div className="text-slate-300">
              <span className="text-blue-400">🛡️</span> Defense: {stats.defense}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBattleLog = () => {
    return (
      <div className="bg-slate-900/50 p-4 rounded-lg border border-amber-700/30 mb-6 max-h-32 overflow-y-auto">
        <h4 className="text-amber-400 font-kanit font-medium mb-2">Battle Log</h4>
        <div className="space-y-1 text-sm">
          {battleState.log.slice(-5).map((entry, index) => (
            <div key={index} className="text-slate-300">
              {entry}
            </div>
          ))}
          {isProcessing && (
            <div className="text-yellow-400 animate-pulse">
              Processing action...
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBattleResult = () => {
    if (!battleState.result) return null;
    
    const { victory, experienceGained, itemDropped, monsterRecruited } = battleState.result;
    
    return (
      <div className="bg-slate-900/90 p-6 rounded-lg border-2 border-amber-500/50 mb-6">
        <h3 className="text-2xl font-kanit font-bold text-center mb-4">
          {victory ? (
            <span className="text-green-400">🎉 Victory! 🎉</span>
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
              onBattleEnd(battleState.result!);
            }}
            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6 font-kanit">
      <h2 className="text-3xl font-kanit font-bold mb-6 text-center text-amber-400 border-b-2 border-amber-500/50 pb-3">⚔️ Battle ⚔️</h2>
      
      {renderBattleLog()}
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="transform transition-all hover:scale-105 duration-300">{renderCharacterStats()}</div>
        <div className="transform transition-all hover:scale-105 duration-300">{renderMonsterStats()}</div>
      </div>
      
      {battleState.isOver ? (
        renderBattleResult()
      ) : (
        <div className="bg-slate-900/50 p-6 rounded-lg border border-amber-700/30">
          <h3 className="text-xl font-kanit font-bold text-amber-400 mb-4 text-center">
            {battleState.turn === 'character' ? "Your Turn" : "Monster's Turn"}
          </h3>
          
          {battleState.turn === 'character' && !isProcessing && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleAction('attack')}
                disabled={isProcessing}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⚔️ Attack
              </button>
              <button
                onClick={() => handleAction('defend')}
                disabled={isProcessing}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🛡️ Defend
              </button>
              <button
                onClick={() => {
                  setShowSkillsMenu(true);
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
                onClick={() => handleFlee()}
                disabled={isProcessing}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🏃 Flee
              </button>
            </div>
          )}
          
          {isProcessing && (
            <div className="text-center text-yellow-400 animate-pulse">
              <div className="text-lg">⚡ Processing...</div>
            </div>
          )}
        </div>
      )}

      {showSkillsMenu && (
        <SkillsMenu
          skills={availableSkills}
          character={battleState.character}
          onSkillSelect={handleSkillAction}
          onClose={() => {
            setShowSkillsMenu(false);
            soundService.playSound('menu-close', 0.4).catch(err => {
              console.warn('Failed to play menu close sound:', err);
            });
          }}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default BattleScreen;
