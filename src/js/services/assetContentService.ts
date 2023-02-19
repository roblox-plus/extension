import xsrfFetch from '../utils/xsrfFetch';

const getAssetContentsUrl = async (assetId: number): Promise<URL> => {
  const headers = new Headers();
  headers.set('Roblox-Browser-Asset-Request', 'roblox.plus');

  const response = await xsrfFetch(
    new URL(`https://assetdelivery.roblox.com/v1/assets/batch`),
    {
      method: 'POST',
      headers: headers,
      body: JSON.stringify([
        {
          assetId: assetId,
          requestId: 'requested-asset',
        },
      ]),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch asset contents URL (${assetId})`);
  }

  const result = await response.json();
  return new URL(result[0].location);
};

export { getAssetContentsUrl };
