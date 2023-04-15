// This class can be used to concurrently cache items, or fetch their values.
class ExpirableDictionary<T> {
  private lockKey: string;
  private expirationInMilliseconds: number;

  // The items that are in the dictionary.
  private items: { [key: string]: T } = {};

  constructor(
    // A name for the dictionary, used for locking.
    name: string,

    // How long the item will remain in the dictionary, in milliseconds.
    expirationInMilliseconds: number
  ) {
    this.lockKey = `ExpirableDictionary:${name}`;
    this.expirationInMilliseconds = expirationInMilliseconds;
  }

  // Tries to fetch an item by its key from the dictionary, or it will call the value factory to add it in.
  getOrAdd(key: string, valueFactory: () => Promise<T>): Promise<T> {
    const item = this.items[key];
    if (item !== undefined) {
      return Promise.resolve(item);
    }

    return new Promise(async (resolve, reject) => {
      await navigator.locks.request(`${this.lockKey}:${key}`, async () => {
        // It's possible the item was added since we requested the lock, check again.
        const item = this.items[key];
        if (item !== undefined) {
          resolve(item);
          return;
        }

        try {
          const value = (this.items[key] = await valueFactory());

          setTimeout(() => {
            delete this.items[key];
          }, this.expirationInMilliseconds);

          resolve(value);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

export default ExpirableDictionary;
