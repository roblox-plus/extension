import xsrfFetch from '../utils/xsrfFetch';

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

export { deleteAsset };
