import OwnedLimitedAsset from '../types/ownedLimitedAsset';
import { BatchedPromise } from '../utils/batchedPromise';
import wait from '../utils/wait';
import xsrfFetch from '../utils/xsrfFetch';

const getLimitedInventory = BatchedPromise<OwnedLimitedAsset[]>(
  {
    maxBatchSize: 1,
    cacheDuration: 5 * 60 * 1000,
    backgroundServiceKey: 'inventoryService.getLimitedInventory',
  },
  async (userIds) => {
    const foundUserAssetIds = new Set<number>();
    const limitedAssets: OwnedLimitedAsset[] = [];
    let nextPageCursor = '';

    do {
      const response = await fetch(
        `https://inventory.roblox.com/v1/users/${userIds[0]}/assets/collectibles?limit=100&cursor=${nextPageCursor}`
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

    return [limitedAssets];
  }
);

const deleteAsset = async (assetId: number) => {
  const response = await xsrfFetch(
    new URL(`https://assetgame.roblox.com/asset/delete-from-inventory`),
    {
      method: 'POST',
      body: JSON.stringify({
        assetId: assetId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to remove asset (${assetId})`);
  }
};

export { deleteAsset, getLimitedInventory };
