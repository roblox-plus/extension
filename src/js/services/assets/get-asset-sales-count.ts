import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../message';

const messageDestination = 'assetsService.getAssetSalesCount';
const cache = new ExpirableDictionary<number>(messageDestination, 30 * 1000);

// The type for the message being passed to the background.
type BackgroundMessage = {
  assetId: number;
};

const getAssetSalesCount = async (assetId: number) => {
  return sendMessage(messageDestination, { assetId } as BackgroundMessage);
};

const loadAssetSalesCount = async (assetId: number) => {
  const response = await fetch(
    `https://economy.roblox.com/v2/assets/${assetId}/details`
  );

  if (!response.ok) {
    throw new Error('Failed to load asset product info');
  }

  const result = await response.json();
  return result.Sales || NaN;
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.assetId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadAssetSalesCount(message.assetId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getAssetSalesCount;
