import { Batch, BatchItem } from '@tix-factory/batch';
import { User } from 'roblox';
import ExpirableDictionary from '../../utils/expireableDictionary';
import xsrfFetch from '../../utils/xsrfFetch';
import { addListener, sendMessage } from '../message';

const messageDestination = 'usersService.getUserByName';

// The type for the message being passed to the background.
type BackgroundMessage = {
  name: string;
};

class UserNamesBatchProcessor extends Batch<string, User | null> {
  constructor() {
    super({
      levelOfParallelism: 1,
      maxSize: 100,
      minimumDelay: 1000,
      enqueueDeferDelay: 10,
    });
  }

  async process(items: BatchItem<string, User | null>[]) {
    const response = await xsrfFetch(
      new URL(`https://users.roblox.com/v1/usernames/users`),
      {
        method: 'POST',
        body: JSON.stringify({
          usernames: items.map((i) => i.key),
          excludeBannedUsers: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to users by names');
    }

    const result = await response.json();
    items.forEach((item) => {
      const user = result.data.find(
        (a: any) => a.requestedUsername === item.key
      );

      if (user) {
        item.resolve({
          id: user.id,
          name: user.name,
          displayName: user.displayName,
        });
      } else {
        item.resolve(null);
      }
    });
  }

  getKey(item: string): string {
    return item;
  }
}

const batchProcessor = new UserNamesBatchProcessor();
const cache = new ExpirableDictionary<User | null>(
  messageDestination,
  2 * 60 * 1000
);

// Fetches the date when a badge was awarded to the specified user.
const getUserByName = async (name: string): Promise<User | null> => {
  return sendMessage(messageDestination, {
    name: name.toLowerCase(),
  } as BackgroundMessage);
};

// Listen for messages sent to the service worker.
addListener(messageDestination, (message: BackgroundMessage) => {
  // Check the cache
  return cache.getOrAdd(batchProcessor.getKey(message.name), () => {
    // Queue up the fetch request, when not in the cache
    return batchProcessor.enqueue(message.name);
  });
});

export default getUserByName;
