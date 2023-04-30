import ExpirableDictionary from '../../utils/expireableDictionary';
import wait from '../../utils/wait';
import { addListener, sendMessage } from '../message';

const messageDestination = 'currencyService.getRobuxBalance';
const cache = new ExpirableDictionary<number>(messageDestination, 30 * 1000);
const failureDelay = 5 * 1000;

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the Robux balance of the currently authenticated user.
const getRobuxBalance = (userId: number): Promise<number> => {
  return sendMessage(messageDestination, { userId } as BackgroundMessage);
};

// Loads the Robux balance of the currently authenticated user.
const loadRobuxBalance = async (userId: number): Promise<number> => {
  const response = await fetch(
    `https://economy.roblox.com/v1/users/${userId}/currency`
  );

  // If we fail to send the request, delay the response to ensure we don't spam the API.
  if (response.status === 401) {
    await wait(failureDelay);
    throw 'User is unauthenticated';
  } else if (!response.ok) {
    await wait(failureDelay);
    throw 'Failed to load Robux balance';
  }

  const result = await response.json();

  try {
    // HACK: Continue recording Robux history to not impact current functionality.
    window.RPlus.robuxHistory?.recordUserRobux(userId, result.robux);
  } catch (err) {
    console.warn('Failed to record robuxHistory');
  }

  return result.robux;
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.userId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadRobuxBalance(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getRobuxBalance;
