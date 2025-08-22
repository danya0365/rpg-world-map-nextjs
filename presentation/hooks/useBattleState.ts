import { useState, useEffect } from 'react';
import { BattleState, BattleResult } from '../../domain/interfaces/IBattleService';
import { Skill } from '../../domain/entities/Skill';
import { getContainer } from '../../infrastructure/config/DIContainer';
import { ISkillService } from '../../domain/interfaces/ISkillService';
import { ISoundService } from '../../domain/interfaces/ISoundService';

interface BattleSummary {
  damageDealt: number;
  damageTaken: number;
  turnsElapsed: number;
  criticalHits: number;
  itemsUsed: number;
}

interface UseBattleStateReturn {
  battleState: BattleState;
  setBattleState: React.Dispatch<React.SetStateAction<BattleState>>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  availableSkills: Skill[];
  showSkillsMenu: boolean;
  setShowSkillsMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showDetailedResults: boolean;
  setShowDetailedResults: React.Dispatch<React.SetStateAction<boolean>>;
  battleSummary: BattleSummary;
  turnCount: number;
  setTurnCount: React.Dispatch<React.SetStateAction<number>>;
  damageDealt: number;
  setDamageDealt: React.Dispatch<React.SetStateAction<number>>;
  damageTaken: number;
  setDamageTaken: React.Dispatch<React.SetStateAction<number>>;
  criticalHits: number;
  setCriticalHits: React.Dispatch<React.SetStateAction<number>>;
  itemsUsed: { id: string; name: string }[];
  skillService: ISkillService;
  soundService: ISoundService;
}

export const useBattleState = (
  initialBattleState: BattleState,
): UseBattleStateReturn => {
  // State for battle processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [showSkillsMenu, setShowSkillsMenu] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  
  // Battle statistics
  const [turnCount, setTurnCount] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [criticalHits, setCriticalHits] = useState(0);
  const [itemsUsed] = useState<{id: string, name: string}[]>([]);
  
  // Battle summary
  const [battleSummary, setBattleSummary] = useState<BattleSummary>({
    damageDealt: 0,
    damageTaken: 0,
    turnsElapsed: 0,
    criticalHits: 0,
    itemsUsed: 0
  });

  // Get services from DI container
  const skillService = getContainer().resolve<ISkillService>('SkillService');
  const soundService = getContainer().resolve<ISoundService>('SoundService');

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

  // Update battle summary when battle ends
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
    }
  }, [battleState.isOver, battleState.result, damageDealt, damageTaken, turnCount, criticalHits, itemsUsed.length, soundService]);

  return {
    battleState,
    setBattleState,
    isProcessing,
    setIsProcessing,
    availableSkills,
    showSkillsMenu,
    setShowSkillsMenu,
    showDetailedResults,
    setShowDetailedResults,
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
  };
};
