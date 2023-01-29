import { BatchedPromise } from '../utils/batchedPromise';

const getRobuxBalance = BatchedPromise<number>(
  {
    maxBatchSize: 1,
    cacheDuration: 15 * 1000,
    backgroundServiceKey: 'currencyService.getRobuxBalance',
  },
  async (userIds) => {
    const response = await fetch(
      `https://economy.roblox.com/v1/users/${userIds[0]}/currency`
    );

    if (!response.ok) {
      throw new Error(`Failed to load Robux balance (${response.status})`);
    }

    const result = await response.json();
    return [result.robux];
  }
);

export { getRobuxBalance };
