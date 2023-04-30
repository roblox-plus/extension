import OwnedLimitedAsset from '../../types/ownedLimitedAsset';
import ExpirableDictionary from '../../utils/expireableDictionary';
import wait from '../../utils/wait';
import { addListener, sendMessage } from '../message';

const messageDestination = 'inventoryService.getLimitedInventory';
const cache = new ExpirableDictionary<OwnedLimitedAsset[]>(
  messageDestination,
  5 * 60 * 1000
);

// The type for the message being passed to the background.
type BackgroundMessage = {
  userId: number;
};

// Fetches the limited inventory for the specified user.
const getLimitedInventory = (userId: number): Promise<OwnedLimitedAsset[]> => {
  return sendMessage(messageDestination, {
    userId,
  } as BackgroundMessage);
};

// Actually loads the inventory.
const loadLimitedInventory = async (
  userId: number
): Promise<OwnedLimitedAsset[]> => {
  const foundUserAssetIds = new Set<number>();
  const limitedAssets: OwnedLimitedAsset[] = [];
  let nextPageCursor = '';

  do {
    const response = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=100&cursor=${nextPageCursor}`
    );

    if (response.status === 429) {
      // Throttled. Wait a few seconds, and try again.
      await wait(5000);
      continue;
    } else if (response.status === 403) {
      throw new Error('Inventory hidden');
    } else if (!response.ok) {
      throw new Error('Inventory failed to load');
    }

    const result = await response.json();
    nextPageCursor = result.nextPageCursor;

    result.data.forEach((item: any) => {
      const userAssetId = Number(item.userAssetId);
      if (foundUserAssetIds.has(userAssetId)) {
        return;
      }

      foundUserAssetIds.add(userAssetId);
      limitedAssets.push({
        userAssetId,
        id: item.assetId,
        name: item.name,
        recentAveragePrice: item.recentAveragePrice
          ? Number(item.recentAveragePrice)
          : NaN,
        serialNumber: item.serialNumber ? Number(item.serialNumber) : NaN,
      });
    });
  } while (nextPageCursor);

  return limitedAssets;
};

// Listen for background messages
addListener(
  messageDestination,
  (message: BackgroundMessage) => {
    // Check the cache
    return cache.getOrAdd(`${message.userId}`, () =>
      // Queue up the fetch request, when not in the cache
      loadLimitedInventory(message.userId)
    );
  },
  {
    levelOfParallelism: 1,
  }
);

export default getLimitedInventory;
