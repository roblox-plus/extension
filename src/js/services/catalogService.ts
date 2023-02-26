import { BatchedPromise } from '../utils/batchedPromise';

const getAssetSaleCount = BatchedPromise<number>(
  {
    maxBatchSize: 1,
    backgroundServiceKey: 'catalogService.getAssetSaleCount',
  },
  async (assetIds) => {
    const response = await fetch(
      `https://economy.roblox.com/v2/assets/${assetIds[0]}/details`
    );
    const result = await response.json();
    return [result.Sales || NaN];
  }
);

export { getAssetSaleCount };