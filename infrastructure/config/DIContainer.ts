import { CharacterService } from '../../application/services/CharacterService';
import { ItemService } from '../../application/services/ItemService';
import { MonsterService } from '../../application/services/MonsterService';
import { WorldMapService } from '../../application/services/WorldMapService';
import { BattleService } from '../../application/services/BattleService';
import { SkillService } from '../../application/services/SkillService';
import { ICharacterService } from '../../domain/interfaces/ICharacterService';
import { IItemService } from '../../domain/interfaces/IItemService';
import { IMonsterService } from '../../domain/interfaces/IMonsterService';
import { IWorldMapService } from '../../domain/interfaces/IWorldMapService';
import { IBattleService } from '../../domain/interfaces/IBattleService';
import { ISkillService } from '../../domain/interfaces/ISkillService';
import { ISoundService } from '../../domain/interfaces/ISoundService';
import { BrowserSoundService } from '../services/BrowserSoundService';
import { EnemyService } from '../../application/services/EnemyService';
import { IEnemyService } from '../../domain/interfaces/IEnemyService';
import { CharacterRepository } from '../../domain/repositories/CharacterRepository';
import { ItemRepository } from '../../domain/repositories/ItemRepository';
import { MonsterRepository } from '../../domain/repositories/MonsterRepository';
import { WorldMapRepository } from '../../domain/repositories/WorldMapRepository';
import { EnemyRepository } from '../../domain/repositories/EnemyRepository';
import { LocalStorageCharacterRepository } from '../database/LocalStorageCharacterRepository';
import { LocalStorageItemRepository } from '../database/LocalStorageItemRepository';
import { LocalStorageMonsterRepository } from '../database/LocalStorageMonsterRepository';
import { LocalStorageWorldMapRepository } from '../database/LocalStorageWorldMapRepository';
import { LocalStorageEnemyRepository } from '../database/LocalStorageEnemyRepository';
import { DIContainer } from '../di/DIContainer';

export const setupDependencies = (): void => {
  const container = DIContainer.getInstance();
  
  // Register repositories
  container.register<CharacterRepository>('CharacterRepository', new LocalStorageCharacterRepository());
  container.register<ItemRepository>('ItemRepository', new LocalStorageItemRepository());
  container.register<MonsterRepository>('MonsterRepository', new LocalStorageMonsterRepository());
  container.register<WorldMapRepository>('WorldMapRepository', new LocalStorageWorldMapRepository());
  container.register<EnemyRepository>('EnemyRepository', new LocalStorageEnemyRepository());
  
  // Register services
  container.registerSingleton<ICharacterService>(
    'CharacterService',
    CharacterService,
    container.resolve<CharacterRepository>('CharacterRepository')
  );
  
  container.registerSingleton<IItemService>(
    'ItemService',
    ItemService,
    container.resolve<ItemRepository>('ItemRepository')
  );
  
  container.registerSingleton<IMonsterService>(
    'MonsterService',
    MonsterService,
    container.resolve<MonsterRepository>('MonsterRepository')
  );
  
  container.registerSingleton<IWorldMapService>(
    'WorldMapService',
    WorldMapService,
    container.resolve<WorldMapRepository>('WorldMapRepository')
  );
  
  container.registerSingleton<IBattleService>(
    'BattleService',
    BattleService,
    container.resolve<ICharacterService>('CharacterService'),
    container.resolve<IMonsterService>('MonsterService')
  );
  
  container.registerSingleton<IEnemyService>(
    'EnemyService',
    EnemyService,
    container.resolve<EnemyRepository>('EnemyRepository'),
    container.resolve<MonsterRepository>('MonsterRepository'),
    container.resolve<IWorldMapService>('WorldMapService')
  );
  
  container.registerSingleton<ISkillService>(
    'SkillService',
    SkillService
  );

  // Register sound service
  container.registerSingleton<ISoundService>(
    'SoundService',
    BrowserSoundService
  );
};

export const getContainer = (): DIContainer => {
  return DIContainer.getInstance();
};
