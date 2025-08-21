import { Item } from '../entities/Item';

export interface ItemRepository {
  save(item: Item): Promise<void>;
  findById(id: string): Promise<Item | null>;
  findAll(): Promise<Item[]>;
  findByIds(ids: string[]): Promise<Item[]>;
  delete(id: string): Promise<boolean>;
  update(item: Item): Promise<void>;
}
