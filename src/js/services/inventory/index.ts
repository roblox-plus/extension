import xsrfFetch from '../../utils/xsrfFetch';
import { default as getLimitedInventory } from './limitedInventory';

// Removes an asset from the authenticated user's inventory.
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

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { deleteAsset, getLimitedInventory };
