import React, { useEffect, useState } from 'react';
import { getContainer } from '../../../infrastructure/config/DIContainer';
import { IWorldMapService } from '../../../domain/interfaces/IWorldMapService';
import { IMonsterService } from '../../../domain/interfaces/IMonsterService';
import { Location } from '../../../domain/entities/Location';
import { Monster } from '../../../domain/entities/Monster';

interface LocationDetailsProps {
  locationId: string;
  onClose: () => void;
}

const LocationDetails: React.FC<LocationDetailsProps> = ({ locationId, onClose }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const worldMapService = getContainer().resolve<IWorldMapService>('WorldMapService');
  const monsterService = getContainer().resolve<IMonsterService>('MonsterService');

  useEffect(() => {
    const loadLocationDetails = async () => {
      try {
        setLoading(true);
        
        // Get location details
        const locationData = await worldMapService.getLocation(locationId);
        if (!locationData) {
          throw new Error('Location not found');
        }
        
        setLocation(locationData);
        
        // Get possible monsters in this location
        const possibleMonsters = locationData.getPossibleMonsters();
        if (possibleMonsters.length > 0) {
          const monsterDetails = await monsterService.getMonstersByIds(possibleMonsters);
          setMonsters(monsterDetails);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    loadLocationDetails();
  }, [locationId, worldMapService, monsterService]);

  if (loading) {
    return (
      <div className="p-6 border-2 border-amber-700/50 rounded-lg bg-slate-800/90 shadow-lg max-w-md mx-auto font-kanit">
        <div className="flex justify-center">
          <div className="text-amber-400 animate-pulse text-xl">Exploring location...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border-2 border-red-700 rounded-lg bg-slate-800/90 shadow-lg max-w-md mx-auto font-kanit">
        <h3 className="text-xl font-bold mb-2 text-red-400 border-b border-red-700 pb-2">Quest Error</h3>
        <p className="text-red-300 my-4">{error}</p>
        <div className="flex justify-end mt-4">
          <button 
            className="rpg-button"
            onClick={onClose}
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-6 border-2 border-red-700 rounded-lg bg-slate-800/90 shadow-lg max-w-md mx-auto font-kanit">
        <h3 className="text-xl font-bold mb-2 text-red-400 border-b border-red-700 pb-2">Location Not Found</h3>
        <p className="text-red-300 my-4">This area appears to be uncharted territory.</p>
        <div className="flex justify-end mt-4">
          <button 
            className="rpg-button"
            onClick={onClose}
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-2 border-amber-700/50 rounded-lg bg-slate-800/90 shadow-lg max-w-md mx-auto font-kanit">
      <div className="flex items-center justify-between border-b-2 border-amber-700/30 pb-3 mb-4">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
          {location.getName()}
        </h3>
        <div className="text-xs px-2 py-1 bg-amber-800/50 rounded-md text-amber-300 border border-amber-700/50">
          Level {Math.floor(Math.random() * 5) + 1} Area
        </div>
      </div>
      
      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 mb-4">
        <p className="text-slate-300 italic">{location.getDescription()}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
          <h4 className="font-bold text-amber-400 text-sm mb-1">Encounter Rate</h4>
          <div className="flex items-center">
            <div className="h-2 bg-slate-700 rounded-full w-full mr-2">
              <div 
                className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full" 
                style={{ width: `${location.getEncounterRate().rate * 100}%` }}
              ></div>
            </div>
            <span className="text-white font-bold">{Math.round(location.getEncounterRate().rate * 100)}%</span>
          </div>
        </div>
        
        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
          <h4 className="font-bold text-amber-400 text-sm mb-1">Resources</h4>
          <p className="text-slate-300">{Math.floor(Math.random() * 3) + 1} items available</p>
        </div>
      </div>
      
      {monsters.length > 0 && (
        <div className="mb-4 bg-slate-900/30 p-3 rounded-lg border border-slate-700/50">
          <h4 className="font-bold text-amber-400 mb-2">Possible Monsters</h4>
          <div className="grid grid-cols-2 gap-2">
            {monsters.map((monster) => (
              <div 
                key={monster.getId()}
                className="flex items-center p-2 rounded-md bg-slate-800/50 border border-slate-700"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                <div>
                  <div className="text-white font-medium">{monster.getName()}</div>
                  <div className="text-xs text-slate-400">{monster.getType()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-6">
        <button 
          className="text-slate-400 hover:text-amber-400 text-sm flex items-center"
          onClick={() => console.log('Mark on map')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Mark on Map
        </button>
        <button 
          className="rpg-button"
          onClick={onClose}
        >
          Return to Map
        </button>
      </div>
    </div>
  );
};

export default LocationDetails;
