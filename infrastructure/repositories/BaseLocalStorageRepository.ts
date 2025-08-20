export abstract class BaseLocalStorageRepository<T> {
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  protected getItem<U = T>(): U | null {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  protected setItem(data: T): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  protected removeItem(): void {
    localStorage.removeItem(this.storageKey);
  }

  async clear(): Promise<void> {
    this.removeItem();
  }
}
