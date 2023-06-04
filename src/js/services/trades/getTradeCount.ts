import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import { wait } from '@tix-factory/extension-utils';
import { TradeStatusType } from 'roblox';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'tradesService.getTradeCount';
const cache = new ExpirableDictionary<number>(messageDestination, 30 * 1000);
const failureDelay = 5 * 1000;

// The type for the message being passed to the background.
type BackgroundMessage = {
  tradeStatusType: TradeStatusType;
};

// Fetches the unread private message count for the currently authenticated user.
const getTradeCount = (tradeStatusType: TradeStatusType): Promise<number> => {
  return sendMessage(messageDestination, {
    tradeStatusType,
  } as BackgroundMessage);
};

// Loads the unread private message count for the authenticated user.
const loadTradeCount = async (
  tradeStatusType: TradeStatusType
): Promise<number> => {
  // User ID is used as a cache buster.
  const response = await fetch(
    `https://trades.roblox.com/v1/trades/${tradeStatusType}/count`
  );

  // If we fail to send the request, delay the response to ensure we don't spam the API.
  if (response.status === 401) {
    await wait(failureDelay);
    throw 'User is unauthenticated';
  } else if (!response.ok) {
    await wait(failureDelay);
    throw `Failed to load ${tradeStatusType} trade count`;
  }

  const result = await response.json();
  return result.count;
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.tradeStatusType}`, () =>
      // Queue up the fetch request, when not in the cache
      loadTradeCount(message.tradeStatusType)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getTradeCount;
