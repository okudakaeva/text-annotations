interface IStorageLike extends Storage {
  get length (): number;

  clear (): void;

  getItem (key: string): string | null;

  key (index: number): string | null;

  removeItem (key: string): void;

  setItem (key: string, value: string): void;
}

class StorageLike implements IStorageLike {
  private readonly storage: Storage | Map<string, string>;

  constructor () {
    if (this.isAvailable('localStorage')) {
      this.storage = window['localStorage'];
    } else if (this.isAvailable('sessionStorage')) {
      this.storage = window['sessionStorage'];
    } else {
      this.storage = new Map<string, string>();
    }
  }

  get length (): number {
    return this.isMap() ? this.storage.size : (this.storage as Storage).length;
  }

  clear () {
    this.storage.clear();
  }

  getItem (key: string): string | null {
    return this.isMap() ? this.storage.get(key) || null : (this.storage as Storage).getItem(key);
  }

  key (index: number): string | null {
    if (this.isMap()) {
      const keys: string[] = Array.from(this.storage.keys());
      return keys[index] || null;
    } else {
      return (this.storage as Storage).key(index);
    }
  }

  removeItem (key: string) {
    if (this.isMap()) {
      this.storage.delete(key);
    } else {
      (this.storage as Storage).removeItem(key);
    }
  }

  setItem (key: string, value: string) {
    if (this.isMap()) {
      this.storage.set(key, value);
    } else {
      (this.storage as Storage).setItem(key, value);
    }
  }

  private isMap (): boolean {
    return this.storage instanceof Map;
  }

  private isAvailable (type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const x = "__test__";

      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const CommonStorage = new StorageLike();
