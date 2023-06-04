import { Batch, BatchItem } from '@tix-factory/batch';
import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import { User } from 'roblox';
import ExpirableDictionary from '../../utils/expireableDictionary';
import xsrfFetch from '../../utils/xsrfFetch';

const messageDestination = 'usersService.getUserById';

// The type for the message being passed to the background.
type BackgroundMessage = {
  id: number;
};

class UsersBatchProcessor extends Batch<number, User | null> {
  constructor() {
    super({
      levelOfParallelism: 1,
      maxSize: 100,
      minimumDelay: 1000,
      enqueueDeferDelay: 10,
    });
  }

  async process(items: BatchItem<number, User | null>[]) {
    const response = await xsrfFetch(
      new URL(`https://users.roblox.com/v1/users`),
      {
        method: 'POST',
        body: JSON.stringify({
          userIds: items.map((i) => i.key),
          excludeBannedUsers: false,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to users by ids');
    }

    const result = await response.json();
    items.forEach((item) => {
      const user = result.data.find((a: any) => a.id === item.value);

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

  getKey(item: number): string {
    return item.toString();
  }
}

const batchProcessor = new UsersBatchProcessor();
const cache = new ExpirableDictionary<User | null>(
  messageDestination,
  2 * 60 * 1000
);

// Fetches the date when a badge was awarded to the specified user.
const getUserById = async (id: number): Promise<User | null> => {
  return sendMessage(messageDestination, {
    id,
  } as BackgroundMessage);
};

// Listen for messages sent to the service worker.
addListener(messageDestination, (message: BackgroundMessage) => {
  // Check the cache
  return cache.getOrAdd(batchProcessor.getKey(message.id), () => {
    // Queue up the fetch request, when not in the cache
    return batchProcessor.enqueue(message.id);
  });
});

export default getUserById;
