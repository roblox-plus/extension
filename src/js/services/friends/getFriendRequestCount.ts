import { wait } from '@tix-factory/extension-utils';
import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../message';

const messageDestination = 'friendsService.getFriendRequestCount';
const cache = new ExpirableDictionary<number>(messageDestination, 30 * 1000);
const failureDelay = 5 * 1000;

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the inbound friend request count for the currently authenticated user.
const getFriendRequestCount = (userId: number): Promise<number> => {
  return sendMessage(messageDestination, { userId } as BackgroundMessage);
};

// Loads the inbound friend request count for the currently authenticated user.
const loadFriendRequestCount = async (userId: number): Promise<number> => {
  // User ID is used as a cache buster.
  const response = await fetch(
    `https://friends.roblox.com/v1/user/friend-requests/count`
  );

  // If we fail to send the request, delay the response to ensure we don't spam the API.
  if (response.status === 401) {
    await wait(failureDelay);
    throw 'User is unauthenticated';
  } else if (!response.ok) {
    await wait(failureDelay);
    throw 'Failed to load friend request count';
  }

  const result = await response.json();
  return result.count;
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.userId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadFriendRequestCount(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getFriendRequestCount;
