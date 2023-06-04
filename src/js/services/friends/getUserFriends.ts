import { addListener, sendMessage } from '@tix-factory/messaging';
import { User } from 'roblox';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'friendsService.getUserFriends';
const cache = new ExpirableDictionary<User[]>(messageDestination, 60 * 1000);

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the list of friends for the user.
const getUserFriends = (userId: number): Promise<User[]> => {
  return sendMessage(messageDestination, {
    userId,
  } as BackgroundMessage);
};

// Loads the actual friend list for the user.
const loadUserFriends = async (userId: number): Promise<User[]> => {
  const response = await fetch(
    `https://friends.roblox.com/v1/users/${userId}/friends`
  );

  if (!response.ok) {
    throw new Error(`Failed to load friends for user (${userId})`);
  }

  const result = await response.json();
  return result.data.map((r: any) => {
    return {
      id: r.id,
      name: r.name,
      displayName: r.displayName,
    };
  });
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.userId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadUserFriends(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getUserFriends;
