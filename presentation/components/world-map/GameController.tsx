"use client";

import React, { useEffect, useState } from 'react';
import { BattleResult, BattleState, IBattleService } from '../../../domain/interfaces/IBattleService';
import { ICharacterService } from '../../../domain/interfaces/ICharacterService';
import { IEnemyService } from '../../../domain/interfaces/IEnemyService';
import { IMonsterService } from '../../../domain/interfaces/IMonsterService';
import { IWorldMapService } from '../../../domain/interfaces/IWorldMapService';
import { getContainer, setupDependencies } from '../../../infrastructure/config/DIContainer';
import { Monster, MonsterData } from '../../../domain/entities/Monster';
import { MonsterRepository } from '../../../domain/repositories/MonsterRepository';
import BattleScreen from './BattleScreen';
import LocationDetails from './LocationDetails';
import WorldMap from './WorldMap';

// Game states
type GameState = 'map' | 'battle' | 'location';

interface GameControllerProps {
  characterId?: string;
  worldMapId?: string;
}

const GameController: React.FC<GameControllerProps> = ({ 
  characterId: initialCharacterId, 
  worldMapId: initialWorldMapId 
}) => {
  // Initialize DI container
  useEffect(() => {
    setupDependencies();
  }, []);

  const [gameState, setGameState] = useState<GameState>('map');
  const [characterId, setCharacterId] = useState<string | null>(initialCharacterId || null);
  const [worldMapId, setWorldMapId] = useState<string | null>(initialWorldMapId || null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enemiesSpawned, setEnemiesSpawned] = useState(false);

  // Create default character and world map if not provided
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        
        const characterService = getContainer().resolve<ICharacterService>('CharacterService');
        const worldMapService = getContainer().resolve<IWorldMapService>('WorldMapService');
        
        let charId = characterId;
        let mapId = worldMapId;
        
        // Create default character if not provided
        if (!charId) {
          const defaultCharacter = await characterService.createCharacter('Hero');
          charId = defaultCharacter.getId();
          setCharacterId(charId);
        }
        
        // Create default world map if not provided
        if (!mapId) {
          const defaultWorldMap = await worldMapService.createWorldMap('Eldoria', 100, 100);
          mapId = defaultWorldMap.getId();
          setWorldMapId(mapId);
          
          // Set character position on the map - start at the central town
          await characterService.moveCharacter(charId, { x: 50, y: 50, worldMapId: mapId });
          
          // Create diverse locations on the map with varied descriptions and encounter rates
          
          // Towns and settlements
          const townLocation = await worldMapService.createLocation(
            'Emberhold',
            'A bustling town built around an ancient forge. The air is thick with smoke from the blacksmiths, and the sound of hammers rings through the streets. The townsfolk are hardy and skilled in metalworking.',
            0.05, // Very low encounter rate
            []
          );
          
          const villageLocation = await worldMapService.createLocation(
            'Willowbrook',
            'A peaceful farming village nestled in a valley. Fields of golden wheat sway in the breeze, and the smell of freshly baked bread wafts from thatched cottages. The villagers are wary of strangers but kind once you earn their trust.',
            0.1,
            ['wild_dog', 'thief']
          );
          
          const outpostLocation = await worldMapService.createLocation(
            'Sentinel Outpost',
            'A military outpost guarding the northern pass. Stern-faced guards patrol the walls, keeping watch for threats from the wilderness. Merchants often rest here before continuing their journey.',
            0.15,
            ['bandit', 'deserter']
          );
          
          // Wilderness areas
          const forestLocation = await worldMapService.createLocation(
            'Whispering Woods',
            'An ancient forest where the trees seem to whisper secrets to those who listen. Shafts of emerald light pierce through the dense canopy, illuminating patches of mysterious fungi and rare herbs. Many adventurers claim to have seen fey creatures dancing between the trees at dusk.',
            0.4,
            ['wolf', 'forest_sprite', 'giant_spider', 'dryad']
          );
          
          const swampLocation = await worldMapService.createLocation(
            'Mistmire',
            'A treacherous swamp shrouded in perpetual mist. The ground is unstable, with patches that look solid often giving way to deep, murky water. Strange lights flicker in the distance, luring unwary travelers deeper into the mire.',
            0.6,
            ['swamp_troll', 'will_o_wisp', 'giant_leech', 'bog_zombie']
          );
          
          const mountainLocation = await worldMapService.createLocation(
            'Frostpeak Range',
            'Towering mountains with snow-capped peaks that pierce the clouds. The air is thin and bitterly cold, making each step a challenge. Caves dot the mountainside, some hiding valuable ore deposits, others concealing dangerous predators.',
            0.5,
            ['mountain_goat', 'ice_elemental', 'yeti', 'griffon']
          );
          
          // Dangerous areas
          const caveLocation = await worldMapService.createLocation(
            'Shadowfang Caverns',
            'A vast network of dark caves extending deep into the earth. Stalactites hang like fangs from the ceiling, and the walls glitter with strange crystals that emit an eerie glow. The deeper chambers are said to house ancient treasures guarded by fearsome beasts.',
            0.7,
            ['cave_bat', 'troll', 'shadow_beast', 'crystal_golem']
          );
          
          const ruinsLocation = await worldMapService.createLocation(
            'Fallen Citadel',
            'The crumbling remains of a once-mighty fortress. Ivy-covered walls and collapsed towers tell of its former glory. Scholars believe it was destroyed during a great magical cataclysm centuries ago. The ruins are now home to various creatures and possibly undead guardians of the past.',
            0.65,
            ['skeleton_warrior', 'ghost', 'animated_armor', 'gargoyle']
          );
          
          const dungeonLocation = await worldMapService.createLocation(
            'Dreadmire Dungeon',
            'An abandoned prison carved into the side of a cliff. Iron bars have rusted, and cells stand empty, but chains still rattle mysteriously in the darkness. The warden was rumored to practice dark magic on prisoners, and his experiments may still roam the lower levels.',
            0.8,
            ['prisoner_wraith', 'mimic', 'abomination', 'shadow_warden']
          );
          
          // Magical locations
          const towerLocation = await worldMapService.createLocation(
            'Astral Spire',
            'A slender tower of impossible height, seemingly made of opalescent crystal that changes color with the time of day. It belongs to an eccentric archmage who welcomes visitors seeking magical knowledge—if they can solve his riddles.',
            0.3,
            ['animated_book', 'mana_sprite', 'apprentice_golem']
          );
          
          const groveLocation = await worldMapService.createLocation(
            'Sacred Grove',
            'A perfectly circular clearing where ancient trees form a natural cathedral. The air is filled with floating pollen that glimmers like stardust. Druids gather here during solstices to perform rituals that maintain the balance of nature in the surrounding lands.',
            0.25,
            ['forest_guardian', 'faerie_dragon', 'treant']
          );
          
          const portalLocation = await worldMapService.createLocation(
            'Voidrift',
            'A tear in reality where the fabric between worlds has worn thin. Strange energies crackle in the air, and glimpses of other realms occasionally flash into view. Scholars study it from a safe distance, as creatures from beyond sometimes slip through.',
            0.55,
            ['void_crawler', 'phase_beast', 'reality_shifter']
          );
          
          // Create some monster data for spawning enemies
          const monsterService = getContainer().resolve<IMonsterService>('MonsterService');
          
          // Create monsters if they don't exist yet
          const createMonsterIfNotExists = async (id: string, name: string, type: string, health: number, attack: number, defense: number, speed: number, xp: number) => {
            const existingMonster = await monsterService.getMonster(id);
            if (!existingMonster) {
              // Create basic monster first
              await monsterService.createMonster(name, type);
              
              // Since we can't directly modify the monster properties with setters,
              // we'll create a new monster with the correct ID and properties via the repository
              const monsterRepository = getContainer().resolve<MonsterRepository>('MonsterRepository');
              
              // Create monster data with all required properties
              const monsterData: MonsterData = {
                id,
                name,
                type,
                stats: {
                  health,
                  maxHealth: health,
                  attack,
                  defense,
                  speed,
                  experienceReward: xp
                },
                canBeRecruited: true,
                dropRate: 0.3,
                possibleDrops: []
              };
              
              // Save the monster data directly to repository
              await monsterRepository.save(new Monster(monsterData));
            }
          };
          
          // Create basic monsters
          await createMonsterIfNotExists('wolf', 'Wolf', 'beast', 20, 8, 5, 10, 15);
          await createMonsterIfNotExists('bandit', 'Bandit', 'human', 25, 7, 6, 8, 20);
          await createMonsterIfNotExists('giant_spider', 'Giant Spider', 'insect', 15, 10, 3, 12, 18);
          await createMonsterIfNotExists('skeleton_warrior', 'Skeleton Warrior', 'undead', 30, 9, 8, 6, 25);
          await createMonsterIfNotExists('swamp_troll', 'Swamp Troll', 'troll', 40, 12, 10, 4, 35);
          
          // Add locations to the map - using a try/catch for each location to handle potential errors
          const locationsToAdd = [
            { location: townLocation, x: 50, y: 50, name: 'Emberhold' },
            { location: villageLocation, x: 35, y: 45, name: 'Willowbrook' },
            { location: outpostLocation, x: 65, y: 30, name: 'Sentinel Outpost' },
            { location: forestLocation, x: 40, y: 60, name: 'Whispering Woods' },
            { location: swampLocation, x: 25, y: 70, name: 'Mistmire' },
            { location: mountainLocation, x: 80, y: 20, name: 'Frostpeak Range' },
            { location: caveLocation, x: 70, y: 65, name: 'Shadowfang Caverns' },
            { location: ruinsLocation, x: 55, y: 75, name: 'Fallen Citadel' },
            { location: dungeonLocation, x: 85, y: 80, name: 'Dreadmire Dungeon' },
            { location: towerLocation, x: 60, y: 40, name: 'Astral Spire' },
            { location: groveLocation, x: 30, y: 55, name: 'Sacred Grove' },
            { location: portalLocation, x: 75, y: 45, name: 'Voidrift' }
          ];
          
          for (const { location, x, y, name } of locationsToAdd) {
            try {
              await worldMapService.addLocationToMap(mapId, location.getId(), x, y);
              console.log(`Added ${name} location to map at (${x}, ${y})`);
            } catch (error) {
              console.error(`Failed to add ${name} location: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    initializeGame();
  }, [characterId, worldMapId]);

  // Spawn enemies on the map
  useEffect(() => {
    const spawnEnemies = async () => {
      if (!worldMapId || enemiesSpawned || loading) return;
      
      try {
        const enemyService = getContainer().resolve<IEnemyService>('EnemyService');
        const monsterService = getContainer().resolve<IMonsterService>('MonsterService');
        
        // Get all available monster IDs
        const monsters = await monsterService.getAllMonsters();
        const monsterIds = monsters.map(monster => monster.getId());
        
        if (monsterIds.length > 0) {
          // Spawn 20 random enemies across the map
          await enemyService.spawnRandomEnemies(worldMapId, 20, monsterIds);
          console.log('Spawned enemies on the map');
          setEnemiesSpawned(true);
        }
      } catch (err) {
        console.error('Failed to spawn enemies:', err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    spawnEnemies();
  }, [worldMapId, enemiesSpawned, loading]);
  
  // Handle battle encounter
  const handleEncounter = (state: BattleState) => {
    setBattleState(state);
    setGameState('battle');
  };

  // Handle battle end
  const handleBattleEnd = (result: BattleResult) => {
    // Process battle results
    if (result.victory) {
      // Could show a victory message or update UI with rewards
      console.log(`Victory! XP gained: ${result.experienceGained}`);
      
      if (result.itemDropped) {
        console.log(`Item dropped: ${result.itemDropped.getName()}`);
      }
      
      if (result.monsterRecruited) {
        console.log(`Monster recruited: ${result.monsterRecruited.getName()}`);
      }
    } else {
      console.log('Battle lost or fled');
    }
    
    // Return to map and completely reset battle state
    setBattleState(null);
    setGameState('map');
    
    // Force refresh character data to ensure proper state reset
    const characterService = getContainer().resolve<ICharacterService>('CharacterService');
    characterService.getCharacter(characterId!).then(() => {
      console.log('Character data refreshed after battle');
    }).catch(err => {
      console.error('Failed to refresh character data:', err);
    });
  };
  
  // Handle direct battle with enemy
  const handleEnemyBattle = async (enemyId: string) => {
    try {
      const enemyService = getContainer().resolve<IEnemyService>('EnemyService');
      const battleService = getContainer().resolve<IBattleService>('BattleService');
      
      // Get the enemy
      const enemy = await enemyService.getEnemy(enemyId);
      if (!enemy) {
        throw new Error(`Enemy with id ${enemyId} not found`);
      }
      
      // Deactivate the enemy (remove from map)
      await enemyService.deactivateEnemy(enemyId);
      
      // Initiate battle with the monster
      const battleState = await battleService.initiateBattle(characterId!, enemy.getMonsterId());
      
      // Show battle screen
      handleEncounter(battleState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Handle location enter
  const handleLocationEnter = (locId: string) => {
    setLocationId(locId);
    setGameState('location');
  };

  // Handle location close
  const handleLocationClose = () => {
    setLocationId(null);
    setGameState('map');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-kanit">
        <div className="text-xl text-amber-400 animate-pulse">Loading your adventure...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-300 p-6 border-2 border-red-700 rounded-lg shadow-lg font-kanit max-w-md mx-auto my-8">
        <h3 className="text-xl font-bold mb-2 text-red-200">Quest Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="rpg-button mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!characterId || !worldMapId) {
    return (
      <div className="bg-red-900/30 text-red-300 p-6 border-2 border-red-700 rounded-lg shadow-lg font-kanit max-w-md mx-auto my-8">
        <h3 className="text-xl font-bold mb-2 text-red-200">Game Initialization Failed</h3>
        <p>Unable to create character or world map.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="rpg-button mt-4"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-kanit">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-md">RPG World Map Game</h1>
        
        <div className="flex gap-2">
          <button className="rpg-button text-sm">
            Character
          </button>
          <button className="rpg-button text-sm">
            Inventory
          </button>
        </div>
      </div>
      
      <div className="bg-slate-800/50 border-2 border-amber-700/50 rounded-lg p-4 shadow-lg">
        {gameState === 'map' && (
          <WorldMap
            characterId={characterId}
            worldMapId={worldMapId}
            onEncounter={handleEncounter}
            onLocationEnter={handleLocationEnter}
            onEnemyBattle={handleEnemyBattle}
          />
        )}
        
        {gameState === 'battle' && battleState && (
          <BattleScreen
            battleState={battleState}
            onBattleEnd={handleBattleEnd}
          />
        )}
        
        {gameState === 'location' && locationId && (
          <LocationDetails
            locationId={locationId}
            onClose={handleLocationClose}
          />
        )}
      </div>
      
      <div className="mt-4 text-sm text-slate-400 text-center">
        <p>Game State: <span className="text-amber-400">{gameState}</span></p>
      </div>
    </div>
  );
};

export default GameController;
