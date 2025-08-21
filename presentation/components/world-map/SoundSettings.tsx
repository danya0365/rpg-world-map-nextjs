import React, { useState, useEffect } from 'react';
import { ISoundService } from '../../../domain/interfaces/ISoundService';
import { getContainer } from '../../../infrastructure/config/DIContainer';

const SoundSettings: React.FC = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.7);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  const soundService = getContainer().resolve<ISoundService>('SoundService');
  
  useEffect(() => {
    // Initialize state from sound service
    setIsSoundEnabled(soundService.isSoundEnabled());
    setVolume(soundService.getVolume());
  }, [soundService]);
  
  const handleToggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    if (newState) {
      soundService.enableSound();
    } else {
      soundService.disableSound();
    }
    
    // Play a sound when enabling to give feedback
    if (newState) {
      soundService.playSound('click', 0.5).catch(err => {
        console.warn('Failed to play click sound:', err);
      });
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundService.setVolume(newVolume);
    
    // Play a sound to demonstrate volume change
    soundService.playSound('click', newVolume).catch(err => {
      console.warn('Failed to play click sound:', err);
    });
  };
  
  const togglePanel = () => {
    setIsOpen(!isOpen);
    soundService.playSound('click', 0.5).catch(err => {
      console.warn('Failed to play click sound:', err);
    });
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Sound settings button */}
      <button 
        onClick={togglePanel}
        className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-full shadow-lg"
        title="Sound Settings"
      >
        {isSoundEnabled ? (
          <span role="img" aria-label="Sound On" className="text-xl">🔊</span>
        ) : (
          <span role="img" aria-label="Sound Off" className="text-xl">🔇</span>
        )}
      </button>
      
      {/* Settings panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-slate-800 border border-amber-500 rounded-lg p-4 shadow-lg w-64">
          <h3 className="text-amber-400 font-bold mb-3">Sound Settings</h3>
          
          <div className="mb-4">
            <label className="flex items-center justify-between text-white">
              <span>Enable Sound</span>
              <div 
                onClick={handleToggleSound} 
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${isSoundEnabled ? 'bg-amber-500' : 'bg-gray-600'}`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isSoundEnabled ? 'translate-x-6' : 'translate-x-1'} mt-0.5`}
                ></div>
              </div>
            </label>
          </div>
          
          <div className="mb-2">
            <label className="block text-white mb-1">Volume: {Math.round(volume * 100)}%</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume} 
              onChange={handleVolumeChange}
              disabled={!isSoundEnabled}
              className="w-full accent-amber-500"
            />
          </div>
          
          <div className="mt-4 text-xs text-gray-400">
            <p>Sound effects will play during battles and interactions.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoundSettings;
