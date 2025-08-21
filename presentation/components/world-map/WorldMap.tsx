import React, { useEffect, useState, useCallback, useRef } from 'react';
import WorldMapTile, { TileType } from './WorldMapTile';
import CharacterStatusPanel from './CharacterStatusPanel';
import { getContainer } from '../../../infrastructure/config/DIContainer';
import { IWorldMapService } from '../../../domain/interfaces/IWorldMapService';
import { ICharacterService } from '../../../domain/interfaces/ICharacterService';
import { IBattleService, BattleState } from '../../../domain/interfaces/IBattleService';
import { IEnemyService } from '../../../domain/interfaces/IEnemyService';
import { IMonsterService } from '../../../domain/interfaces/IMonsterService';
import { WorldMap as WorldMapEntity } from '../../../domain/entities/WorldMap';
import { Enemy } from '../../../domain/entities/Enemy';

interface WorldMapProps {
  characterId: string;
  worldMapId: string;
  onEncounter: (battleState: BattleState) => void;
  onLocationEnter: (locationId: string) => void;
  onEnemyBattle: (enemyId: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({
  characterId,
  worldMapId,
  onEncounter,
  onLocationEnter,
  onEnemyBattle
}) => {
  const [mapData, setMapData] = useState<WorldMapEntity | null>(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [monstersById, setMonstersById] = useState<Record<string, {name: string, type: string}>>({});
  const [hpRestorationMessage, setHpRestorationMessage] = useState<string | null>(null);
  const [characterRefreshTrigger, setCharacterRefreshTrigger] = useState<number>(0);
  
  // Ref to store the HP restoration interval
  const hpRestorationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Constants for viewport and map size
  const VIEWPORT_SIZE = 15;
  const MAP_SIZE = 100;

  // Get services from DI container
  const worldMapService = getContainer().resolve<IWorldMapService>('WorldMapService');
  const characterService = getContainer().resolve<ICharacterService>('CharacterService');
  const battleService = getContainer().resolve<IBattleService>('BattleService');
  const enemyService = getContainer().resolve<IEnemyService>('EnemyService');
  const monsterService = getContainer().resolve<IMonsterService>('MonsterService');

  // Update viewport position based on player position
  const updateViewportPosition = useCallback((playerX: number, playerY: number) => {
    // Calculate new viewport position to keep player centered
    let newViewportX = viewportPosition.x;
    let newViewportY = viewportPosition.y;
    
    // If player is too close to the edge of the viewport, shift the viewport
    const bufferZone = 3; // How close to the edge before shifting viewport
    
    if (playerX < viewportPosition.x + bufferZone) {
      newViewportX = Math.max(0, playerX - bufferZone);
    } else if (playerX >= viewportPosition.x + VIEWPORT_SIZE - bufferZone) {
      newViewportX = Math.min(MAP_SIZE - VIEWPORT_SIZE, playerX - VIEWPORT_SIZE + bufferZone + 1);
    }
    
    if (playerY < viewportPosition.y + bufferZone) {
      newViewportY = Math.max(0, playerY - bufferZone);
    } else if (playerY >= viewportPosition.y + VIEWPORT_SIZE - bufferZone) {
      newViewportY = Math.min(MAP_SIZE - VIEWPORT_SIZE, playerY - VIEWPORT_SIZE + bufferZone + 1);
    }
    
    if (newViewportX !== viewportPosition.x || newViewportY !== viewportPosition.y) {
      setViewportPosition({ x: newViewportX, y: newViewportY });
    }
  }, [viewportPosition, VIEWPORT_SIZE, MAP_SIZE]);
  
  // Load map data and character position
  const loadMapData = useCallback(async () => {
    try {
      setLoading(true);
      const worldMap = await worldMapService.getWorldMap(worldMapId);
      if (!worldMap) {
        throw new Error('World map not found');
      }
      
      const character = await characterService.getCharacter(characterId);
      if (!character) {
        throw new Error('Character not found');
      }
      
      const position = character.getPosition();
      if (position.worldMapId !== worldMapId) {
        throw new Error('Character is not on this world map');
      }
      
      // Load enemies on the map
      const mapEnemies = await enemyService.getActiveEnemiesByWorldMapId(worldMapId);
      setEnemies(mapEnemies);
      
      // Load monster details for all enemies
      const monsterIds = [...new Set(mapEnemies.map(enemy => enemy.getMonsterId()))];
      const monsters = await monsterService.getMonstersByIds(monsterIds);
      
      // Create a lookup object for monster details
      const monstersLookup: Record<string, {name: string, type: string}> = {};
      monsters.forEach(monster => {
        monstersLookup[monster.getId()] = {
          name: monster.getName(),
          type: monster.getType()
        };
      });
      setMonstersById(monstersLookup);
      
      setMapData(worldMap);
      setPlayerPosition({ x: position.x, y: position.y });
      
      // Center viewport on player position
      const viewportX = Math.max(0, Math.min(position.x - Math.floor(VIEWPORT_SIZE / 2), MAP_SIZE - VIEWPORT_SIZE));
      const viewportY = Math.max(0, Math.min(position.y - Math.floor(VIEWPORT_SIZE / 2), MAP_SIZE - VIEWPORT_SIZE));
      setViewportPosition({ x: viewportX, y: viewportY });
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  }, [worldMapId, characterId, worldMapService, characterService, enemyService, monsterService]);

  // HP Restoration System
  const startHPRestorationSystem = useCallback(() => {
    // Clear any existing interval
    if (hpRestorationIntervalRef.current) {
      clearInterval(hpRestorationIntervalRef.current);
    }
    
    // Set up a new interval that runs every 5 seconds
    hpRestorationIntervalRef.current = setInterval(async () => {
      try {
        // Get current character data
        const character = await characterService.getCharacter(characterId);
        if (!character) return;
        
        const stats = character.getStats();
        
        // Only restore HP if character is not at full health
        if (stats.health < stats.maxHealth) {
          // Calculate HP to restore (5% of max HP, minimum 1)
          const hpToRestore = Math.max(1, Math.floor(stats.maxHealth * 0.05));
          
          // Don't exceed max health
          const newHealth = Math.min(stats.maxHealth, stats.health + hpToRestore);
          
          // Update character health using the heal method
          const healAmount = newHealth - stats.health;
          await characterService.heal(characterId, healAmount);
          
          // Show restoration message
          setHpRestorationMessage(`+${healAmount} HP restored (${newHealth}/${stats.maxHealth})`);
          
          // Clear message after 3 seconds
          setTimeout(() => {
            setHpRestorationMessage(null);
          }, 3000);
          
          // Trigger character status panel refresh
          setCharacterRefreshTrigger(prev => prev + 1);
          
          // Refresh character data in the status panel
          loadMapData();
        }
      } catch (error) {
        console.error('HP restoration error:', error);
      }
    }, 5000);
  }, [characterId, characterService, loadMapData]);
  
  // Initialize map data and HP restoration system
  useEffect(() => {
    loadMapData();
    
    // Start HP restoration system
    startHPRestorationSystem();
    
    // Cleanup interval on component unmount
    return () => {
      if (hpRestorationIntervalRef.current) {
        clearInterval(hpRestorationIntervalRef.current);
      }
    };
  }, [loadMapData, startHPRestorationSystem]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (loading || !mapData) return;
      
      let newX = playerPosition.x;
      let newY = playerPosition.y;
      
      switch (e.key) {
        case 'ArrowUp':
          newY = Math.max(0, playerPosition.y - 1);
          break;
        case 'ArrowDown':
          newY = Math.min(MAP_SIZE - 1, playerPosition.y + 1);
          break;
        case 'ArrowLeft':
          newX = Math.max(0, playerPosition.x - 1);
          break;
        case 'ArrowRight':
          newX = Math.min(MAP_SIZE - 1, playerPosition.x + 1);
          break;
        default:
          return;
      }
      
      // Check if the tile is walkable
      if (!mapData.isPositionWalkable(newX, newY)) {
        return;
      }
      
      try {
        // Move character
        await characterService.moveCharacter(characterId, { x: newX, y: newY });
        setPlayerPosition({ x: newX, y: newY });
        
        // Update viewport if player is near the edge
        updateViewportPosition(newX, newY);
        
        // Check for location
        const location = mapData.getLocationAtPosition(newX, newY);
        if (location) {
          onLocationEnter(location.getId());
          
          // Check for random encounter
          // Assuming character level 1 for now, should be retrieved from character
          const encounter = location.checkEncounter(1);
          if (encounter) {
            const monsterId = location.getRandomMonsterId();
            if (monsterId) {
              const battleState = await battleService.initiateBattle(characterId, monsterId);
              onEncounter(battleState);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerPosition, mapData, loading, characterId, characterService, battleService, onEncounter, onLocationEnter, updateViewportPosition]);

  // This function has been moved above to be wrapped in useCallback

  // Handle tile click
  const handleTileClick = async (x: number, y: number) => {
    if (loading || !mapData) return;
    
    // Convert viewport coordinates to world coordinates
    const worldX = x + viewportPosition.x;
    const worldY = y + viewportPosition.y;
    
    // Check if the tile is walkable
    if (!mapData.isPositionWalkable(worldX, worldY)) {
      return;
    }
    
    try {
      // Check if there's an enemy at this position
      const enemyAtPosition = enemies.find(enemy => {
        const pos = enemy.getPosition();
        return pos.x === worldX && pos.y === worldY;
      });
      
      if (enemyAtPosition) {
        // Trigger battle with the enemy
        onEnemyBattle(enemyAtPosition.getId());
        
        // Remove enemy from local state to update UI immediately
        setEnemies(enemies.filter(e => e.getId() !== enemyAtPosition.getId()));
        return;
      }
      
      // Move character
      await characterService.moveCharacter(characterId, { x: worldX, y: worldY });
      setPlayerPosition({ x: worldX, y: worldY });
      
      // Update viewport if needed
      updateViewportPosition(worldX, worldY);
      
      // Check for location
      const location = mapData.getLocationAtPosition(worldX, worldY);
      if (location) {
        onLocationEnter(location.getId());
        
        // Check for random encounter
        // Assuming character level 1 for now, should be retrieved from character
        const encounter = location.checkEncounter(1);
        if (encounter) {
          const monsterId = location.getRandomMonsterId();
          if (monsterId) {
            const battleState = await battleService.initiateBattle(characterId, monsterId);
            onEncounter(battleState);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 font-kanit">
        <div className="text-lg text-amber-400 animate-pulse">Loading world map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-300 p-4 border-2 border-red-700 rounded-lg shadow-lg font-kanit">
        <h3 className="text-lg font-bold mb-2 text-red-200">Map Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!mapData) {
    return (
      <div className="bg-red-900/30 text-red-300 p-4 border-2 border-red-700 rounded-lg shadow-lg font-kanit">
        <h3 className="text-lg font-bold mb-2 text-red-200">Map Not Found</h3>
        <p>Unable to load world map data.</p>
      </div>
    );
  }

  // Render map grid (only the visible viewport)
  const renderMapGrid = () => {
    if (!mapData) return [];
    
    const grid = [];
    
    // Only render the viewport area
    for (let viewY = 0; viewY < VIEWPORT_SIZE; viewY++) {
      const row = [];
      const worldY = viewY + viewportPosition.y;
      
      for (let viewX = 0; viewX < VIEWPORT_SIZE; viewX++) {
        const worldX = viewX + viewportPosition.x;
        
        // Check if this position is within the world bounds
        if (worldX >= 0 && worldX < MAP_SIZE && worldY >= 0 && worldY < MAP_SIZE) {
          const tile = mapData.getTile(worldX, worldY) || { type: 'unknown' };
          const isPlayerPosition = playerPosition.x === worldX && playerPosition.y === worldY;
          const location = mapData.getLocationAtPosition(worldX, worldY);
          
          // Check if there's an enemy at this position
          const enemyAtPosition = enemies.find(enemy => {
            const pos = enemy.getPosition();
            return pos.x === worldX && pos.y === worldY;
          });
          
          // Get monster details if there's an enemy
          const monsterDetails = enemyAtPosition ? monstersById[enemyAtPosition.getMonsterId()] : null;
          
          row.push(
            <WorldMapTile
              key={`${worldX}-${worldY}`}
              type={tile.type as TileType}
              x={viewX} // Use viewport coordinates for the tile
              y={viewY}
              isPlayerPosition={isPlayerPosition}
              hasLocation={!!location}
              hasEnemy={!!enemyAtPosition}
              enemyType={monsterDetails?.type || ''}
              enemyName={monsterDetails?.name || ''}
              isWalkable={mapData.isPositionWalkable(worldX, worldY)}
              onClick={() => handleTileClick(viewX, viewY)}
            />
          );
        } else {
          // Render an empty/void tile for out-of-bounds areas
          row.push(
            <WorldMapTile
              key={`void-${viewX}-${viewY}`}
              type="unknown"
              x={viewX}
              y={viewY}
              isPlayerPosition={false}
              hasLocation={false}
              isWalkable={false}
              onClick={() => {}}
            />
          );
        }
      }
      
      grid.push(
        <div key={`row-${worldY}`} className="flex">
          {row}
        </div>
      );
    }
    
    return grid;
  };
  
  // Render mini-map
  const renderMiniMap = () => {
    if (!mapData) return null;
    
    const miniMapSize = 100; // Size in pixels
    const tileSize = miniMapSize / MAP_SIZE;
    
    return (
      <div className="relative bg-slate-900 border border-amber-700/50 rounded-lg overflow-hidden" 
           style={{ width: `${miniMapSize}px`, height: `${miniMapSize}px` }}>
        {/* Viewport indicator */}
        <div className="absolute border-2 border-amber-400" 
             style={{
               left: `${viewportPosition.x * tileSize}px`,
               top: `${viewportPosition.y * tileSize}px`,
               width: `${VIEWPORT_SIZE * tileSize}px`,
               height: `${VIEWPORT_SIZE * tileSize}px`,
             }}></div>
        
        {/* Player position */}
        <div className="absolute bg-amber-500 rounded-full" 
             style={{
               left: `${playerPosition.x * tileSize - 1}px`,
               top: `${playerPosition.y * tileSize - 1}px`,
               width: `${3}px`,
               height: `${3}px`,
             }}></div>
             
        {/* Locations */}
        {mapData.getAllLocations().map(location => {
          // Find location position by checking all tiles
          let locationPos = null;
          for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
              const locAtPos = mapData.getLocationAtPosition(x, y);
              if (locAtPos && locAtPos.getId() === location.getId()) {
                locationPos = { x, y };
                break;
              }
            }
            if (locationPos) break;
          }
          
          if (locationPos) {
            return (
              <div 
                key={location.getId()}
                className="absolute bg-emerald-400 rounded-full" 
                style={{
                  left: `${locationPos.x * tileSize}px`,
                  top: `${locationPos.y * tileSize}px`,
                  width: `${2}px`,
                  height: `${2}px`,
                }}
              ></div>
            );
          }
          return null;
        })}
        
        {/* Enemies */}
        {enemies.map(enemy => {
          const pos = enemy.getPosition();
          return (
            <div 
              key={enemy.getId()}
              className="absolute bg-red-500 rounded-full" 
              style={{
                left: `${pos.x * tileSize}px`,
                top: `${pos.y * tileSize}px`,
                width: `${2}px`,
                height: `${2}px`,
              }}
              title={monstersById[enemy.getMonsterId()]?.name || 'Enemy'}
            ></div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 font-kanit">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">World Map</h2>
      
      <div className="mb-4 bg-slate-900/50 p-3 rounded-lg border border-amber-700/30 shadow-inner">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-300">Use <span className="text-amber-400">arrow keys</span> to navigate or <span className="text-amber-400">click</span> on a tile to move.</p>
            <p className="text-slate-300">Current position: <span className="text-amber-400">({playerPosition.x}, {playerPosition.y})</span></p>
            {hpRestorationMessage && (
              <p className="text-green-400 mt-1 animate-pulse">{hpRestorationMessage}</p>
            )}
          </div>
          <div>
            <button className="rpg-button text-sm" onClick={() => loadMapData()}>
              Refresh Map
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <div className="border-4 border-amber-900/50 rounded-lg overflow-hidden shadow-lg inline-block bg-slate-900/30">
          {renderMapGrid()}
        </div>
        
        <div className="flex flex-col gap-3">
          {/* Character Status Panel */}
          <CharacterStatusPanel 
          characterId={characterId}
          onRefresh={() => loadMapData()}
          refreshTrigger={characterRefreshTrigger}
        />  
          <div className="bg-slate-900/50 p-3 rounded-lg border border-amber-700/30 shadow-inner">
            <h3 className="text-sm font-bold text-amber-400 mb-2">Mini Map</h3>
            {renderMiniMap()}
            <div className="mt-2 text-xs text-slate-400">
              <p>Map Size: {MAP_SIZE}x{MAP_SIZE}</p>
              <p>Viewport: {VIEWPORT_SIZE}x{VIEWPORT_SIZE}</p>
            </div>
          </div>
          
          <div className="bg-slate-900/50 p-3 rounded-lg border border-amber-700/30 shadow-inner">
            <h3 className="text-sm font-bold text-amber-400 mb-2">Navigation</h3>
            <div className="grid grid-cols-3 gap-1 w-24 mx-auto">
              <div></div>
              <button 
                className="rpg-button text-xs p-1" 
                onClick={() => handleTileClick(7, 6)}
              >↑</button>
              <div></div>
              <button 
                className="rpg-button text-xs p-1" 
                onClick={() => handleTileClick(6, 7)}
              >←</button>
              <div className="bg-slate-800 rounded-md flex items-center justify-center text-amber-500">⦿</div>
              <button 
                className="rpg-button text-xs p-1" 
                onClick={() => handleTileClick(8, 7)}
              >→</button>
              <div></div>
              <button 
                className="rpg-button text-xs p-1" 
                onClick={() => handleTileClick(7, 8)}
              >↓</button>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-slate-400">
        <p>Legend: <span className="text-amber-400">⬤</span> Player | <span className="text-emerald-400">◆</span> Location | <span className="text-red-500">✶</span> Enemy | <span className="text-slate-500">■</span> Unwalkable</p>
      </div>
    </div>
  );
};

export default WorldMap;
