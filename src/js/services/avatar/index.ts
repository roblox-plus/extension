import { AssetType } from 'roblox';
import AvatarAsset from '../../types/avatar-asset';
import xsrfFetch from '../../utils/xsrfFetch';
import getAvatarAssetRules from './get-avatar-asset-rules';

const getAvatarAssets = async (userId: number): Promise<AvatarAsset[]> => {
  const response = await fetch(
    `https://avatar.roblox.com/v1/users/${userId}/avatar`
  );

  if (!response.ok) {
    throw new Error(`Failed to load avatar (${response.status})`);
  }

  const result = await response.json();
  const assets: AvatarAsset[] = result.assets.map((asset: any) => {
    return {
      id: asset.id,
      name: asset.name,
      assetType: asset.assetType.id as AssetType,
    };
  });

  result.emotes.forEach((emote: any) => {
    assets.push({
      id: emote.assetId,
      name: emote.assetName,
      assetType: AssetType.Emote,
    });
  });

  return assets;
};

const wearItem = async (assetId: number, authenticatedUserId: number) => {
  // Use set-wearing-assets instead of wear because it will allow more than the limit
  const currentAssets = await getAvatarAssets(authenticatedUserId);
  const response = await xsrfFetch(
    new URL(`https://avatar.roblox.com/v1/avatar/set-wearing-assets`),
    {
      method: 'POST',
      body: JSON.stringify({
        assetIds: [assetId].concat(
          currentAssets
            .filter((a) => a.assetType !== AssetType.Emote)
            .map((a) => a.id)
        ),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to wear asset (${assetId})`);
  }

  const result = await response.json();
  if (result.invalidAssetIds.length > 0) {
    throw new Error(
      `Failed to wear assets (${result.invalidAssetIds.join(', ')})`
    );
  }
};

const removeItem = async (assetId: number) => {
  const response = await xsrfFetch(
    new URL(`https://avatar.roblox.com/v1/avatar/assets/${assetId}/remove`),
    {
      method: 'POST',
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to remove asset (${assetId})`);
  }
};

// To ensure the webpack service loader can discover the methods: import it, then export it again.
export { getAvatarAssetRules, getAvatarAssets, wearItem, removeItem };
