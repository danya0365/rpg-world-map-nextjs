import { useEffect } from 'react';
import { ISoundService } from '../../domain/interfaces/ISoundService';
import { BattleState } from '../../domain/interfaces/IBattleService';

interface UseBattleSoundProps {
  soundService: ISoundService;
  battleState: BattleState;
}

interface UseBattleSoundReturn {
  playMenuOpenSound: () => void;
  playMenuCloseSound: () => void;
  playButtonSound: () => void;
}

export const useBattleSound = ({
  soundService,
  battleState
}: UseBattleSoundProps): UseBattleSoundReturn => {
  
  // Initialize battle music when component mounts
  useEffect(() => {
    // Play battle music
    soundService.playMusic('battle-music', true, 0.4).catch(err => {
      console.warn('Failed to play battle music:', err);
    });
    
    // Stop battle music when component unmounts
    return () => {
      soundService.stopSound('battle-music');
    };
  }, [soundService]);

  // Play victory or defeat sound when battle ends
  useEffect(() => {
    if (battleState.isOver && battleState.result) {
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
  }, [battleState.isOver, battleState.result, soundService]);

  // Helper functions for UI sound effects
  const playMenuOpenSound = () => {
    soundService.playSound('menu-open', 0.4).catch(err => {
      console.warn('Failed to play menu open sound:', err);
    });
  };

  const playMenuCloseSound = () => {
    soundService.playSound('menu-close', 0.4).catch(err => {
      console.warn('Failed to play menu close sound:', err);
    });
  };

  const playButtonSound = () => {
    soundService.playSound('button-click', 0.4).catch(err => {
      console.warn('Failed to play button click sound:', err);
    });
  };

  return {
    playMenuOpenSound,
    playMenuCloseSound,
    playButtonSound
  };
};
