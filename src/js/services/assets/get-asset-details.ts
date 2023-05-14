import ExpirableDictionary from '../../utils/expireableDictionary';
import { addListener, sendMessage } from '../message';
import AssetDetails from '../../types/asset-details';
import AssetType from '../../enums/assetType';

const messageDestination = 'assetsService.getAssetDetails';
const cache = new ExpirableDictionary<AssetDetails>(
  messageDestination,
  5 * 60 * 1000
);

// The type for the message being passed to the background.
type BackgroundMessage = {
  assetId: number;
};

const getAssetDetails = async (assetId: number) => {
  return sendMessage(messageDestination, { assetId } as BackgroundMessage);
};

const loadAssetDetails = async (assetId: number): Promise<AssetDetails> => {
  const response = await fetch(
    `https://economy.roblox.com/v2/assets/${assetId}/details`
  );

  if (!response.ok) {
    throw new Error('Failed to load asset product info');
  }

  const result = await response.json();
  return {
    id: assetId,
    name: result.Name,
    type: result.AssetTypeId as AssetType,
    sales: result.Sales,
  };
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.assetId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadAssetDetails(message.assetId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getAssetDetails;
