import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Character, Stats } from '../../../domain/entities/Character';
import { getContainer } from '../../../infrastructure/config/DIContainer';
import { ICharacterService } from '../../../domain/interfaces/ICharacterService';
import { IItemService } from '../../../domain/interfaces/IItemService';

interface CharacterStatusPanelProps {
  characterId: string;
  onRefresh?: () => void;
  refreshTrigger?: number; // Add trigger prop for external refresh
}

const CharacterStatusPanel: React.FC<CharacterStatusPanelProps> = ({ 
  characterId,
  onRefresh,
  refreshTrigger 
}) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [inventoryItems, setInventoryItems] = useState<Array<{ id: string, name: string, type: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Ref for auto-refresh interval
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const characterService = getContainer().resolve<ICharacterService>('CharacterService');
  const itemService = getContainer().resolve<IItemService>('ItemService');

  const loadCharacterData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load character data
      const characterData = await characterService.getCharacter(characterId);
      if (!characterData) {
        throw new Error('Character not found');
      }
      
      setCharacter(characterData);
      setStats(characterData.getStats());
      
      // Load inventory items
      const inventoryIds = characterData.getInventory();
      if (inventoryIds.length > 0) {
        const items = await itemService.getItemsByIds(inventoryIds);
        const formattedItems = items.map(item => ({
          id: item.getId(),
          name: item.getName(),
          type: item.getType()
        }));
        setInventoryItems(formattedItems);
      } else {
        setInventoryItems([]);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
    }
  }, [characterId, characterService, itemService]);

  // Load character data when component mounts or characterId changes
  useEffect(() => {
    loadCharacterData();
    
    // Set up auto-refresh every 2 seconds to sync with HP restoration
    refreshIntervalRef.current = setInterval(() => {
      loadCharacterData();
    }, 2000);
    
    // Cleanup interval on component unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadCharacterData]);

  // Refresh when external trigger changes (e.g., from HP restoration)
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadCharacterData();
    }
  }, [refreshTrigger, loadCharacterData]);

  const calculateExpProgress = () => {
    if (!stats) return 0;
    const experienceNeeded = stats.level * 100;
    return (stats.experience / experienceNeeded) * 100;
  };

  const calculateHealthPercentage = () => {
    if (!stats) return 0;
    return (stats.health / stats.maxHealth) * 100;
  };

  if (loading) {
    return (
      <div className="bg-slate-900/50 p-3 rounded-lg border border-amber-700/30 shadow-inner animate-pulse">
        <p className="text-amber-400/50">Loading character data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-300 p-3 border border-red-700 rounded-lg">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!character || !stats) {
    return (
      <div className="bg-red-900/30 text-red-300 p-3 border border-red-700 rounded-lg">
        <p className="text-sm">Character data not available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 p-3 rounded-lg border border-amber-700/30 shadow-inner transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-amber-400">Character Status</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-2 py-1 rounded transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button 
            onClick={() => {
              loadCharacterData();
              if (onRefresh) onRefresh();
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-2 py-1 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-lg font-bold">
          {character.getName().charAt(0)}
        </div>
        <div>
          <h4 className="font-medium text-amber-300">{character.getName()}</h4>
          <p className="text-xs text-slate-400">Level {stats.level} Adventurer</p>
        </div>
      </div>
      
      {/* Health Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-red-400">HP</span>
          <span className="text-slate-300">{stats.health}/{stats.maxHealth}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
            style={{ width: `${calculateHealthPercentage()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Experience Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-blue-400">EXP</span>
          <span className="text-slate-300">{stats.experience}/{stats.level * 100}</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500"
            style={{ width: `${calculateExpProgress()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Basic Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-slate-800/70 rounded p-1">
          <p className="text-xs text-slate-400">Attack</p>
          <p className="text-sm text-amber-300">{stats.attack}</p>
        </div>
        <div className="bg-slate-800/70 rounded p-1">
          <p className="text-xs text-slate-400">Defense</p>
          <p className="text-sm text-amber-300">{stats.defense}</p>
        </div>
        <div className="bg-slate-800/70 rounded p-1">
          <p className="text-xs text-slate-400">Speed</p>
          <p className="text-sm text-amber-300">{stats.speed}</p>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-3 border-t border-amber-700/30 pt-3 animate-fadeIn">
          {/* Inventory */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-amber-400 mb-1">Inventory ({inventoryItems.length})</h4>
            {inventoryItems.length > 0 ? (
              <div className="max-h-24 overflow-y-auto bg-slate-800/50 rounded p-1">
                <ul className="text-xs">
                  {inventoryItems.map(item => (
                    <li key={item.id} className="py-1 px-2 hover:bg-slate-700/50 rounded flex justify-between">
                      <span className="text-slate-300">{item.name}</span>
                      <span className="text-slate-500">{item.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No items in inventory</p>
            )}
          </div>
          
          {/* Allies */}
          <div>
            <h4 className="text-xs font-medium text-amber-400 mb-1">Allies ({character.getAllies().length})</h4>
            {character.getAllies().length > 0 ? (
              <div className="max-h-24 overflow-y-auto bg-slate-800/50 rounded p-1">
                <ul className="text-xs">
                  {character.getAllies().map(allyId => (
                    <li key={allyId} className="py-1 px-2 hover:bg-slate-700/50 rounded">
                      <span className="text-slate-300">Monster #{allyId.substring(0, 8)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No allies recruited</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterStatusPanel;
