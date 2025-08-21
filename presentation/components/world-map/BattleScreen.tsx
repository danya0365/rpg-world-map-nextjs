import React, { useState, useEffect } from 'react';
import { getContainer } from '../../../infrastructure/config/DIContainer';
import { IBattleService, BattleState, BattleResult } from '../../../domain/interfaces/IBattleService';

interface BattleScreenProps {
  battleState: BattleState;
  onBattleEnd: (result: BattleResult) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ battleState: initialBattleState, onBattleEnd }) => {
  const [battleState, setBattleState] = useState(initialBattleState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [characterStats, setCharacterStats] = useState<{
    level: number;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    experience: number;
  } | null>(null);
  const [battleSummary, setBattleSummary] = useState<{
    damageDealt: number;
    damageTaken: number;
    turnsElapsed: number;
    criticalHits: number;
    itemsUsed: number;
  }>({ damageDealt: 0, damageTaken: 0, turnsElapsed: 0, criticalHits: 0, itemsUsed: 0 });
  
  const battleService = getContainer().resolve<IBattleService>('BattleService');

  // Track battle statistics for detailed results
  const [turnCount, setTurnCount] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [criticalHits, setCriticalHits] = useState(0);
  
  // Track items used in battle
  const [itemsUsed, setItemsUsed] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (battleState.isOver && battleState.result) {
      // When battle ends, prepare detailed statistics
      const stats = battleState.character.getStats();
      setCharacterStats({
        level: stats.level,
        health: stats.health,
        maxHealth: stats.maxHealth,
        attack: stats.attack,
        defense: stats.defense,
        experience: stats.experience,
      });
      
      setBattleSummary({
        damageDealt,
        damageTaken,
        turnsElapsed: turnCount,
        criticalHits,
        itemsUsed: itemsUsed.length
      });
      
      // Show detailed results when battle is over
      setShowDetailedResults(true);
    }
  }, [battleState.isOver, battleState.result, battleState.character, damageDealt, damageTaken, turnCount, criticalHits, itemsUsed.length]);

  const handleAction = async (action: 'attack' | 'defend' | 'flee') => {
    if (isProcessing || battleState.isOver) return;
    
    try {
      setIsProcessing(true);
      setTurnCount(prev => prev + 1);
      
      // Perform character action
      const updatedState = await battleService.performCharacterAction(battleState, action);
      
      // Track damage dealt (simplified - in a real implementation, you'd get this from the battle service)
      if (action === 'attack') {
        const damageEstimate = battleState.monster.getStats().health - updatedState.monster.getStats().health;
        setDamageDealt(prev => prev + Math.max(0, damageEstimate));
        
        // Detect critical hits (this is simplified - you'd need logic to detect crits)
        if (damageEstimate > battleState.character.getStats().attack * 1.5) {
          setCriticalHits(prev => prev + 1);
        }
      }
      
      setBattleState(updatedState);
      
      // If battle is over or player fled, end battle
      if (updatedState.isOver) {
        setIsProcessing(false);
        return;
      }
      
      // Perform monster action after a short delay
      setTimeout(async () => {
        const previousHealth = updatedState.character.getStats().health;
        const finalState = await battleService.performMonsterAction(updatedState);
        
        // Track damage taken
        const damageTakenEstimate = previousHealth - finalState.character.getStats().health;
        setDamageTaken(prev => prev + Math.max(0, damageTakenEstimate));
        
        setBattleState(finalState);
        setIsProcessing(false);
        
        // If battle is over after monster's turn, prepare result but don't end battle yet
        if (finalState.isOver && finalState.result) {
          // We'll show confirmation dialog instead of ending immediately
          const result = await battleService.endBattle(finalState);
          if (result) {
            // Update battle state with result but don't exit yet
            setBattleState({
              ...finalState,
              result
            });
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Battle error:', error);
      setIsProcessing(false);
    }
  };
  
  // Handle confirmation to exit battle
  const handleConfirmExit = () => {
    if (battleState.result) {
      onBattleEnd(battleState.result);
    }
  };

  // Auto-scroll battle log to bottom when new entries are added
  const logRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleState.log]);

  const renderBattleLog = () => {
    return (
      <div 
        ref={logRef}
        className="h-40 overflow-y-auto border-2 border-amber-500 p-3 mb-6 bg-slate-900/40 rounded-lg shadow-inner"
      >
        {battleState.log.map((entry: string, index: number) => (
          <p 
            key={index} 
            className={`mb-2 font-kanit ${index === battleState.log.length - 1 ? 'text-amber-400 font-medium animate-pulse' : 'text-amber-200'}`}
          >
            {entry}
          </p>
        ))}
      </div>
    );
  };

  const renderCharacterStats = () => {
    const stats = battleState.character.getStats();
    const healthPercentage = (stats.health / stats.maxHealth) * 100;
    
    return (
      <div className="mb-4 p-4 border-2 border-blue-400 bg-blue-900/50 rounded-lg shadow-md">
        <h3 className="font-kanit font-bold text-lg mb-2 text-blue-200">{battleState.character.getName()}</h3>
        
        {/* Health Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-blue-200">HP</span>
            <span className="text-blue-200">{stats.health}/{stats.maxHealth}</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${healthPercentage > 50 ? 'bg-green-500' : healthPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm text-blue-100">
          <div className="flex items-center">
            <span className="w-6 h-6 mr-2 flex items-center justify-center rounded-full bg-blue-700 text-blue-200">⚔️</span>
            <span>Attack: {stats.attack}</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 mr-2 flex items-center justify-center rounded-full bg-blue-700 text-blue-200">🛡️</span>
            <span>Defense: {stats.defense}</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 mr-2 flex items-center justify-center rounded-full bg-blue-700 text-blue-200">✨</span>
            <span>Level: {stats.level}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMonsterStats = () => {
    const stats = battleState.monster.getStats();
    const healthPercentage = (stats.health / stats.maxHealth) * 100;
    
    return (
      <div className="mb-4 p-4 border-2 border-red-400 bg-red-900/50 rounded-lg shadow-md">
        <h3 className="font-kanit font-bold text-lg mb-2 text-red-200">{battleState.monster.getName()}</h3>
        
        {/* Health Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-red-200">HP</span>
            <span className="text-red-200">{stats.health}/{stats.maxHealth}</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${healthPercentage > 50 ? 'bg-green-500' : healthPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${healthPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm text-red-100">
          <div className="flex items-center">
            <span className="w-6 h-6 mr-2 flex items-center justify-center rounded-full bg-red-700 text-red-200">🔥</span>
            <span>Type: {battleState.monster.getType()}</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 mr-2 flex items-center justify-center rounded-full bg-red-700 text-red-200">⚔️</span>
            <span>Attack: {stats.attack}</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 mr-2 flex items-center justify-center rounded-full bg-red-700 text-red-200">🛡️</span>
            <span>Defense: {stats.defense}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBattleResult = () => {
    if (!battleState.isOver || !battleState.result) return null;
    
    const { victory, experienceGained, itemDropped, monsterRecruited } = battleState.result;
    
    return (
      <div className={`p-6 border-2 rounded-lg mb-4 shadow-lg ${victory ? 'border-amber-500 bg-amber-900/50' : 'border-slate-500 bg-slate-900/50'} animate-fadeIn`}>
        <h3 className={`font-kanit font-bold text-2xl mb-4 text-center ${victory ? 'text-amber-300' : 'text-slate-300'}`}>
          {victory ? '⭐ Victory! ⭐' : '☠️ Defeat! ☠️'}
        </h3>
        
        {/* Basic Results */}
        {!showDetailedResults && victory && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center bg-amber-900/60 p-3 rounded-lg border border-amber-500">
              <span className="text-xl mr-3">✨</span>
              <p className="font-medium text-amber-200">Experience gained: <span className="text-amber-300 font-bold">{experienceGained}</span></p>
            </div>
            
            {itemDropped && (
              <div className="flex items-center bg-blue-900/60 p-3 rounded-lg border border-blue-500">
                <span className="text-xl mr-3">🎁</span>
                <p className="font-medium text-blue-200">Item acquired: <span className="text-blue-300 font-bold">{itemDropped.getName()}</span></p>
              </div>
            )}
            
            {monsterRecruited && (
              <div className="flex items-center bg-green-900/60 p-3 rounded-lg border border-green-500">
                <span className="text-xl mr-3">🤝</span>
                <p className="font-medium text-green-200">Monster recruited: <span className="text-green-300 font-bold">{monsterRecruited.getName()}</span></p>
              </div>
            )}
          </div>
        )}
        
        {/* Detailed Battle Statistics */}
        {showDetailedResults && (
          <div className="space-y-4 mb-6">
            {/* Battle Summary Section */}
            <div className="bg-slate-800/70 p-4 rounded-lg border border-amber-500/50">
              <h4 className="font-kanit font-bold text-lg mb-3 text-amber-300 border-b border-amber-500/30 pb-2">Battle Summary</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-red-800/70 text-red-200">⚔️</span>
                  <div>
                    <p className="text-sm text-slate-400">Damage Dealt</p>
                    <p className="font-medium text-red-300">{battleSummary.damageDealt}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-blue-800/70 text-blue-200">🛡️</span>
                  <div>
                    <p className="text-sm text-slate-400">Damage Taken</p>
                    <p className="font-medium text-blue-300">{battleSummary.damageTaken}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-amber-800/70 text-amber-200">⏱️</span>
                  <div>
                    <p className="text-sm text-slate-400">Turns</p>
                    <p className="font-medium text-amber-300">{battleSummary.turnsElapsed}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-purple-800/70 text-purple-200">⚡</span>
                  <div>
                    <p className="text-sm text-slate-400">Critical Hits</p>
                    <p className="font-medium text-purple-300">{battleSummary.criticalHits}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Rewards Section */}
            {victory && (
              <div className="bg-amber-900/40 p-4 rounded-lg border border-amber-500">
                <h4 className="font-kanit font-bold text-lg mb-3 text-amber-300 border-b border-amber-500/30 pb-2">Rewards</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center bg-amber-900/60 p-3 rounded-lg">
                    <span className="text-xl mr-3">✨</span>
                    <div>
                      <p className="text-sm text-amber-200/70">Experience</p>
                      <p className="font-medium text-amber-300">{experienceGained} XP</p>
                    </div>
                  </div>
                  
                  {itemDropped && (
                    <div className="flex items-center bg-blue-900/60 p-3 rounded-lg">
                      <span className="text-xl mr-3">🎁</span>
                      <div>
                        <p className="text-sm text-blue-200/70">Item</p>
                        <p className="font-medium text-blue-300">{itemDropped.getName()}</p>
                        <p className="text-xs text-blue-200/50 mt-1">{itemDropped.getDescription ? itemDropped.getDescription() : 'A useful item'}</p>
                      </div>
                    </div>
                  )}
                  
                  {monsterRecruited && (
                    <div className="flex items-center bg-green-900/60 p-3 rounded-lg">
                      <span className="text-xl mr-3">🤝</span>
                      <div>
                        <p className="text-sm text-green-200/70">Ally</p>
                        <p className="font-medium text-green-300">{monsterRecruited.getName()}</p>
                        <p className="text-xs text-green-200/50 mt-1">Type: {monsterRecruited.getType()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Character Progress */}
            {victory && characterStats && (
              <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-500">
                <h4 className="font-kanit font-bold text-lg mb-3 text-blue-300 border-b border-blue-500/30 pb-2">Character Progress</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-blue-800/70 text-blue-200">✨</span>
                    <div>
                      <p className="text-sm text-slate-400">Level</p>
                      <p className="font-medium text-blue-300">{characterStats.level}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-8 h-8 mr-2 flex items-center justify-center rounded-full bg-blue-800/70 text-blue-200">📊</span>
                    <div>
                      <p className="text-sm text-slate-400">Experience</p>
                      <p className="font-medium text-blue-300">{characterStats.experience} XP</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Toggle between basic and detailed results */}
        <button 
          className="w-full mb-4 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors duration-200 font-kanit text-sm shadow-md flex items-center justify-center"
          onClick={() => setShowDetailedResults(!showDetailedResults)}
        >
          <span className="mr-2">{showDetailedResults ? '📊' : '📋'}</span>
          {showDetailedResults ? 'Show Basic Results' : 'Show Detailed Statistics'}
        </button>
        
        {/* Continue button that shows confirmation dialog */}
        <button 
          className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors duration-200 font-kanit font-medium text-lg shadow-md"
          onClick={() => setShowConfirmation(true)}
        >
          Continue Adventure
        </button>
      </div>
    );
  };
  
  // Confirmation dialog before exiting battle
  const renderConfirmationDialog = () => {
    if (!showConfirmation) return null;
    
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-slate-800 border-2 border-amber-500 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <h3 className="text-2xl font-kanit font-bold mb-4 text-amber-400 text-center">Leave Battle?</h3>
          
          <p className="text-slate-300 mb-6 text-center">
            Are you sure you want to leave the battle and return to the world map?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              className="flex-1 px-6 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors duration-200 font-kanit"
              onClick={() => setShowConfirmation(false)}
            >
              Stay in Battle
            </button>
            
            <button 
              className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors duration-200 font-kanit font-medium"
              onClick={handleConfirmExit}
            >
              Return to Map
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-slate-900/80 border-2 border-amber-500 rounded-xl shadow-lg">
      <h2 className="text-3xl font-kanit font-bold mb-6 text-center text-amber-400 border-b-2 border-amber-500/50 pb-3">⚔️ Battle ⚔️</h2>
      
      {renderBattleLog()}
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="transform transition-all hover:scale-105 duration-300">{renderCharacterStats()}</div>
        <div className="transform transition-all hover:scale-105 duration-300">{renderMonsterStats()}</div>
      </div>
      
      {battleState.isOver ? (
        renderBattleResult()
      ) : (
        <div className="flex flex-col gap-4 mb-4">
          {/* Main battle actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              className={`px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 shadow-md transition-all duration-200 font-kanit font-medium ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              onClick={() => handleAction('attack')}
              disabled={isProcessing || battleState.turn !== 'character'}
            >
              <span className="flex items-center"><span className="mr-2">⚔️</span> Attack</span>
            </button>
            <button 
              className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-500 hover:to-blue-600 shadow-md transition-all duration-200 font-kanit font-medium ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              onClick={() => handleAction('defend')}
              disabled={isProcessing || battleState.turn !== 'character'}
            >
              <span className="flex items-center"><span className="mr-2">🛡️</span> Defend</span>
            </button>
            <button 
              className={`px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 shadow-md transition-all duration-200 font-kanit font-medium ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              onClick={() => handleAction('flee')}
              disabled={isProcessing || battleState.turn !== 'character'}
            >
              <span className="flex items-center"><span className="mr-2">🏃</span> Flee</span>
            </button>
          </div>
          
          {/* Items section (placeholder for future implementation) */}
          <div className="mt-2 border border-amber-500/30 rounded-lg p-3 bg-slate-800/50">
            <h4 className="text-amber-400 font-kanit font-medium text-center mb-2 text-sm">Items</h4>
            <div className="flex justify-center gap-2">
              <button 
                className="px-3 py-2 bg-green-700/70 text-white rounded hover:bg-green-600/70 transition-colors duration-200 font-kanit text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  // This will be implemented with the item system
                  // For now, just track that an item was used
                  setItemsUsed(prev => [...prev, {id: 'potion-1', name: 'Health Potion'}]);
                }}
                disabled={isProcessing || battleState.turn !== 'character'}
              >
                <span className="mr-1">🧉</span> Health Potion
              </button>
              <button 
                className="px-3 py-2 bg-purple-700/70 text-white rounded hover:bg-purple-600/70 transition-colors duration-200 font-kanit text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setItemsUsed(prev => [...prev, {id: 'bomb-1', name: 'Bomb'}]);
                }}
                disabled={isProcessing || battleState.turn !== 'character'}
              >
                <span className="mr-1">💣</span> Bomb
              </button>
            </div>
          </div>
        </div>
      )}
      
      {battleState.turn !== 'character' && !battleState.isOver && (
        <div className="text-center mt-6 p-3 bg-red-900/40 border border-red-500 rounded-lg">
          <p className="text-red-300 font-kanit font-medium animate-pulse flex items-center justify-center">
            <span className="mr-2">⚠️</span> Monster&apos;s turn...
          </p>
        </div>
      )}
      
      {/* Render confirmation dialog */}
      {renderConfirmationDialog()}
    </div>
  );
};

export default BattleScreen;
