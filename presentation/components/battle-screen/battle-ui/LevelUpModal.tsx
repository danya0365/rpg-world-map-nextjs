import React, { useEffect, useState } from "react";
import { ISoundService } from "../../../../domain/interfaces/ISoundService";
import { LevelUpReward } from "../../../../domain/services/LevelUpService";

interface LevelUpModalProps {
  previousLevel: number;
  currentLevel: number;
  rewards: LevelUpReward;
  onClose: () => void;
  soundService?: ISoundService;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({
  previousLevel,
  currentLevel,
  rewards,
  onClose,
  soundService,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation sequence
  useEffect(() => {
    // Play level up sound
    soundService?.playSound("level-up", 0.7).catch((err: Error) => {
      console.warn("Failed to play level up sound:", err);
    });
    
    // Show stats after a delay
    const statsTimer = setTimeout(() => {
      setShowStats(true);
      soundService?.playSound("menu-open", 0.5);
    }, 1000);
    
    // Show skills after another delay
    const skillsTimer = setTimeout(() => {
      setShowSkills(true);
      if (rewards.newSkills.length > 0) {
        soundService?.playSound("skill-learned", 0.6);
      }
    }, 2000);
    
    return () => {
      clearTimeout(statsTimer);
      clearTimeout(skillsTimer);
    };
  }, [soundService, rewards.newSkills.length]);
  
  // Handle animation steps
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      soundService?.playSound("menu-select", 0.5);
    } else {
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div 
        className="bg-gradient-to-b from-amber-900/90 to-amber-950/90 p-6 rounded-lg border-2 border-amber-500 shadow-lg max-w-md w-full"
        style={{
          animation: "levelUpPulse 2s infinite alternate",
        }}
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-amber-400 mb-2 animate-pulse">
            Level Up!
          </h2>
          <div className="text-xl text-white">
            <span className="text-amber-300">{previousLevel}</span>
            <span className="mx-2">→</span>
            <span className="text-amber-300 text-2xl font-bold">{currentLevel}</span>
          </div>
        </div>
        
        {/* Stats increases */}
        {showStats && (
          <div 
            className="mb-6 bg-slate-800/50 p-4 rounded-lg border border-amber-600/50"
            style={{
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            <h3 className="text-xl font-bold text-amber-400 mb-2">Stats Increased!</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <span className="text-slate-300">Health:</span>
                <span className="ml-auto text-green-400">+{rewards.statIncreases.health}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-300">Attack:</span>
                <span className="ml-auto text-red-400">+{rewards.statIncreases.attack}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-300">Defense:</span>
                <span className="ml-auto text-blue-400">+{rewards.statIncreases.defense}</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-300">Speed:</span>
                <span className="ml-auto text-yellow-400">+{rewards.statIncreases.speed}</span>
              </div>
              {rewards.statIncreases.mana && (
                <div className="flex items-center">
                  <span className="text-slate-300">Mana:</span>
                  <span className="ml-auto text-purple-400">+{rewards.statIncreases.mana}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* New skills */}
        {showSkills && (
          <div 
            className="mb-6"
            style={{
              animation: "fadeIn 0.5s ease-out forwards",
            }}
          >
            <h3 className="text-xl font-bold text-amber-400 mb-2">
              {rewards.newSkills.length > 0 
                ? "New Skills Learned!" 
                : "No New Skills This Level"}
            </h3>
            
            {rewards.newSkills.length > 0 ? (
              <div className="space-y-3">
                {rewards.newSkills.map((skill, index) => (
                  <div 
                    key={skill.getId()} 
                    className="bg-slate-800/70 p-3 rounded-lg border border-amber-600/30 flex items-center"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.2}s forwards`,
                      opacity: 0,
                      transform: "translateY(20px)",
                    }}
                  >
                    <div className="w-10 h-10 bg-amber-700/50 rounded-full flex items-center justify-center mr-3">
                      <span className="text-amber-300 text-lg">✦</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-300">{skill.getName()}</h4>
                      <p className="text-sm text-slate-300">{skill.getDescription()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-2">
                Continue training to unlock more skills!
              </div>
            )}
          </div>
        )}
        
        <div className="text-center">
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
          >
            {currentStep < 2 ? "Continue" : "Close"}
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes levelUpPulse {
          0% { box-shadow: 0 0 10px 2px rgba(245, 158, 11, 0.5); }
          100% { box-shadow: 0 0 20px 5px rgba(245, 158, 11, 0.8); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LevelUpModal;
