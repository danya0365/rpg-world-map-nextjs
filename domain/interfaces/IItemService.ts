import { Item, ItemType } from '../entities/Item';

export interface IItemService {
  createItem(name: string, description: string, type: ItemType): Promise<Item>;
  getItem(id: string): Promise<Item | null>;
  getAllItems(): Promise<Item[]>;
  getItemsByIds(ids: string[]): Promise<Item[]>;
  saveItem(item: Item): Promise<void>;
}
