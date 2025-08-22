import React from 'react';
import { Monster } from '../../../../domain/entities/Monster';

interface MonsterStatsProps {
  monster: Monster;
}

const MonsterStats: React.FC<MonsterStatsProps> = ({ monster }) => {
  const stats = monster.getStats();
  const healthPercentage = (stats.health / stats.maxHealth) * 100;
  
  return (
    <div className="bg-slate-900/80 p-4 rounded-lg border border-red-500/50 shadow-lg">
      <h3 className="text-lg font-kanit font-bold text-red-400 mb-3 text-center">
        👹 {monster.getName()}
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

export default MonsterStats;
