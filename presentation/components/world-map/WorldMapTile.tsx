import React from 'react';

export type TileType = 'grass' | 'water' | 'mountain' | 'forest' | 'desert' | 'cave' | 'town' | 'unknown';

interface WorldMapTileProps {
  type: TileType;
  x: number;
  y: number;
  isPlayerPosition: boolean;
  hasLocation: boolean;
  hasEnemy?: boolean;
  enemyType?: string;
  enemyName?: string;
  isWalkable: boolean;
  onClick?: () => void;
}

const tileColors: Record<TileType, string> = {
  grass: 'bg-gradient-to-b from-green-500 to-green-600',
  water: 'bg-gradient-to-b from-blue-500 to-blue-600',
  mountain: 'bg-gradient-to-b from-gray-500 to-gray-600',
  forest: 'bg-gradient-to-b from-green-700 to-green-800',
  desert: 'bg-gradient-to-b from-yellow-200 to-yellow-300',
  cave: 'bg-gradient-to-b from-gray-700 to-gray-800',
  town: 'bg-gradient-to-b from-amber-600 to-amber-700',
  unknown: 'bg-gradient-to-b from-gray-300 to-gray-400'
};

const tileIcons: Record<TileType, string> = {
  grass: '🌿',
  water: '💧',
  mountain: '⛰️',
  forest: '🌲',
  desert: '🏜️',
  cave: '🕳️',
  town: '🏘️',
  unknown: '❓'
};

const WorldMapTile: React.FC<WorldMapTileProps> = ({
  type,
  x,
  y,
  isPlayerPosition,
  hasLocation,
  hasEnemy = false,
  enemyType = '',
  enemyName = '',
  isWalkable,
  onClick
}) => {
  const baseClasses = `w-12 h-12 flex items-center justify-center border border-slate-700 ${isWalkable ? 'cursor-pointer hover:brightness-110 hover:border-amber-500' : 'cursor-not-allowed opacity-70'}`;
  const colorClass = tileColors[type];
  
  return (
    <div 
      className={`${baseClasses} ${colorClass}`}
      onClick={isWalkable ? onClick : undefined}
      data-x={x}
      data-y={y}
    >
      {isPlayerPosition && (
        <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-amber-300 shadow-lg animate-pulse flex items-center justify-center text-xs font-bold" title="Player">
          P
        </div>
      )}
      {hasLocation && !isPlayerPosition && (
        <div className="w-5 h-5 text-emerald-300 flex items-center justify-center" title="Location">
          <span className="text-lg">◆</span>
        </div>
      )}
      {hasEnemy && !isPlayerPosition && !hasLocation && (
        <div className="w-5 h-5 text-red-500 flex items-center justify-center" title={`${enemyName} (${enemyType})`}>
          <span className="text-lg">✶</span>
        </div>
      )}
      {!isPlayerPosition && !hasLocation && !hasEnemy && (
        <span className="text-xs opacity-40">{tileIcons[type]}</span>
      )}
    </div>
  );
};

export default WorldMapTile;
