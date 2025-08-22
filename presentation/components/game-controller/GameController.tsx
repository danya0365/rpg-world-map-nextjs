"use client";

import BattleScreen from "../world-map/BattleScreen";
import LocationDetails from "../world-map/LocationDetails";
import WorldMap from "../world-map/WorldMap";
import useGameController from "./useGameController";

interface GameControllerProps {
  characterId?: string;
  worldMapId?: string;
}

const GameController = ({
  characterId: initialCharId,
  worldMapId: initialMapId,
}: GameControllerProps) => {
  const {
    gameState,
    characterId,
    worldMapId,
    battleState,
    locationId,
    loading,
    error,
    handleEncounter,
    handleLocationEnter,
    handleEnemyBattle,
    handleBattleEnd,
    handleLocationClose,
  } = useGameController({
    characterId: initialCharId,
    worldMapId: initialMapId,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen font-kanit">
        <div className="text-xl text-amber-400 animate-pulse">
          Loading your adventure...
        </div>
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
        <h3 className="text-xl font-bold mb-2 text-red-200">
          Game Initialization Failed
        </h3>
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
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-md">
          RPG World Map Game
        </h1>

        <div className="flex gap-2">
          <button className="rpg-button text-sm">Character</button>
          <button className="rpg-button text-sm">Inventory</button>
        </div>
      </div>

      <div className="bg-slate-800/50 border-2 border-amber-700/50 rounded-lg p-4 shadow-lg">
        {gameState === "map" && (
          <WorldMap
            characterId={characterId}
            worldMapId={worldMapId}
            onEncounter={handleEncounter}
            onLocationEnter={handleLocationEnter}
            onEnemyBattle={handleEnemyBattle}
          />
        )}

        {gameState === "battle" && battleState && (
          <BattleScreen
            battleState={battleState}
            onBattleEnd={handleBattleEnd}
          />
        )}

        {gameState === "location" && locationId && (
          <LocationDetails
            locationId={locationId}
            onClose={handleLocationClose}
          />
        )}
      </div>

      <div className="mt-4 text-sm text-slate-400 text-center">
        <p>
          Game State: <span className="text-amber-400">{gameState}</span>
        </p>
      </div>
    </div>
  );
};

export default GameController;
