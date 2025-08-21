import { Item, ItemData } from '../../domain/entities/Item';
import { ItemRepository } from '../../domain/repositories/ItemRepository';
import { LocalStorageUtil } from './LocalStorageUtil';

export class LocalStorageItemRepository implements ItemRepository {
  private readonly storagePrefix = 'rpg_item_';

  private getStorageKey(id: string): string {
    return `${this.storagePrefix}${id}`;
  }

  async save(item: Item): Promise<void> {
    const itemData = item.toJSON();
    await LocalStorageUtil.setItem(this.getStorageKey(itemData.id), itemData);
  }

  async findById(id: string): Promise<Item | null> {
    const itemData = await LocalStorageUtil.getItem<ItemData>(this.getStorageKey(id));
    if (!itemData) {
      return null;
    }
    return new Item(itemData);
  }

  async findAll(): Promise<Item[]> {
    const keys = await LocalStorageUtil.getKeysByPrefix(this.storagePrefix);
    const items: Item[] = [];

    for (const key of keys) {
      const itemData = await LocalStorageUtil.getItem<ItemData>(key);
      if (itemData) {
        items.push(new Item(itemData));
      }
    }

    return items;
  }

  async findByIds(ids: string[]): Promise<Item[]> {
    const items: Item[] = [];

    for (const id of ids) {
      const item = await this.findById(id);
      if (item) {
        items.push(item);
      }
    }

    return items;
  }

  async delete(id: string): Promise<boolean> {
    const item = await this.findById(id);
    if (!item) {
      return false;
    }

    await LocalStorageUtil.removeItem(this.getStorageKey(id));
    return true;
  }

  async update(item: Item): Promise<void> {
    await this.save(item);
  }
}
