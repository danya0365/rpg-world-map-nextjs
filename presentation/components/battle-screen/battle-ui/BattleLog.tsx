import React from 'react';

interface BattleLogProps {
  log: string[];
  isProcessing: boolean;
}

const BattleLog: React.FC<BattleLogProps> = ({ log, isProcessing }) => {
  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-amber-700/30 mb-6 max-h-32 overflow-y-auto">
      <h4 className="text-amber-400 font-kanit font-medium mb-2">Battle Log</h4>
      <div className="space-y-1 text-sm">
        {log.slice(-5).map((entry, index) => (
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

export default BattleLog;
