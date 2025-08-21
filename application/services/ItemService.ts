import { v4 as uuidv4 } from 'uuid';
import { Item, ItemEffect, ItemType } from '../../domain/entities/Item';
import { IItemService } from '../../domain/interfaces/IItemService';
import { ItemRepository } from '../../domain/repositories/ItemRepository';

export class ItemService implements IItemService {
  constructor(private itemRepository: ItemRepository) {}

  async createItem(name: string, description: string, type: ItemType): Promise<Item> {
    const id = uuidv4();
    
    // Default effect based on item type
    let effect: ItemEffect | undefined;
    let value = 10;
    
    switch (type) {
      case ItemType.WEAPON:
        effect = {
          statModifier: {
            attack: 5
          },
          isConsumable: false
        };
        value = 50;
        break;
      case ItemType.ARMOR:
        effect = {
          statModifier: {
            defense: 5
          },
          isConsumable: false
        };
        value = 50;
        break;
      case ItemType.POTION:
        effect = {
          healing: 20,
          isConsumable: true
        };
        value = 20;
        break;
      case ItemType.KEY:
        effect = {
          isConsumable: true
        };
        value = 5;
        break;
      case ItemType.TREASURE:
        value = 100;
        break;
    }
    
    const item = new Item({
      id,
      name,
      description,
      type,
      effect,
      value
    });
    
    await this.itemRepository.save(item);
    return item;
  }

  async getItem(id: string): Promise<Item | null> {
    return await this.itemRepository.findById(id);
  }

  async getAllItems(): Promise<Item[]> {
    return await this.itemRepository.findAll();
  }

  async getItemsByIds(ids: string[]): Promise<Item[]> {
    return await this.itemRepository.findByIds(ids);
  }

  async saveItem(item: Item): Promise<void> {
    await this.itemRepository.save(item);
  }
}
