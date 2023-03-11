import { BatchedPromise } from '../utils/batchedPromise';

const getGamePassSaleCount = BatchedPromise<number>(
  {
    maxBatchSize: 1,
    backgroundServiceKey: 'gamePassService.getGamePassSaleCount',
  },
  async (gamePassIds) => {
    const response = await fetch(
      `https://economy.roblox.com/v1/game-pass/${gamePassIds[0]}/game-pass-product-info`
    );

    if (!response.ok) {
      throw new Error('Failed to load game pass product info');
    }

    const result = await response.json();
    return [result.Sales || NaN];
  }
);

export { getGamePassSaleCount };
