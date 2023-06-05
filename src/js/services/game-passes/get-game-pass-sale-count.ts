import { addListener, sendMessage } from '@tix-factory/extension-messaging';
import ExpirableDictionary from '../../utils/expireableDictionary';

const messageDestination = 'gamePassesService.getGamePassSaleCount';
const cache = new ExpirableDictionary<number>(messageDestination, 30 * 1000);

// The type for the message being passed to the background.
type BackgroundMessage = {
  gamePassId: number;
};

const getGamePassSaleCount = async (gamePassId: number) => {
  return sendMessage(messageDestination, { gamePassId } as BackgroundMessage);
};

const loadGamePassSales = async (gamePassId: number) => {
  const response = await fetch(
    `https://economy.roblox.com/v1/game-pass/${gamePassId}/game-pass-product-info`
  );

  if (!response.ok) {
    throw new Error('Failed to load game pass product info');
  }

  const result = await response.json();
  return result.Sales || NaN;
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.gamePassId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadGamePassSales(message.gamePassId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getGamePassSaleCount;
