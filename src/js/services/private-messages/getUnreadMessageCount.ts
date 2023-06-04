import { wait } from '@tix-factory/extension-utils';
import { addListener, sendMessage } from '@tix-factory/messaging';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'privateMessagesService.getUnreadMessageCount';
const cache = new ExpirableDictionary<number>(messageDestination, 30 * 1000);
const failureDelay = 5 * 1000;

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the unread private message count for the currently authenticated user.
const getUnreadMessageCount = (userId: number): Promise<number> => {
  return sendMessage(messageDestination, { userId } as BackgroundMessage);
};

// Loads the unread private message count for the authenticated user.
const loadUnreadMessageCount = async (userId: number): Promise<number> => {
  // User ID is used as a cache buster.
  const response = await fetch(
    `https://privatemessages.roblox.com/v1/messages/unread/count`
  );

  // If we fail to send the request, delay the response to ensure we don't spam the API.
  if (response.status === 401) {
    await wait(failureDelay);
    throw 'User is unauthenticated';
  } else if (!response.ok) {
    await wait(failureDelay);
    throw 'Failed to load unread private message count';
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
      loadUnreadMessageCount(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getUnreadMessageCount;
