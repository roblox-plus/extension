import AssetType from '../enums/assetType';
import AvatarAsset from '../types/avatarAsset';
import AvatarAssetRule from '../types/avatarAssetRule';
import { BatchedPromise } from '../utils/batchedPromise';
import xsrfFetch from '../utils/xsrfFetch';
import { getAuthenticatedUser } from './usersService';

const getAvatarAssets = BatchedPromise<AvatarAsset[]>(
  {
    maxBatchSize: 1,
    cacheDuration: 1000,
    backgroundServiceKey: 'avatarService.getAvatarAssets',
  },
  async (userIds) => {
    const response = await fetch(
      `https://avatar.roblox.com/v1/users/${userIds[0]}/avatar`
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

    return [assets];
  }
);

const _getAvatarAssetRules = BatchedPromise<AvatarAssetRule[]>(
  {
    maxBatchSize: 1,
    cacheDuration: 15 * 60 * 1000,
    backgroundServiceKey: 'avatarService.getAvatarAssetRules',
  },
  async (fakeInput) => {
    const response = await fetch(`https://avatar.roblox.com/v1/avatar-rules`);

    if (!response.ok) {
      throw new Error(`Failed to load avatar rules (${response.status})`);
    }

    const result = await response.json();
    return [
      result.wearableAssetTypes.map((rule: any) => {
        return {
          maxNumber: rule.maxNumber,
          assetType: rule.id as AssetType,
        };
      }),
    ];
  }
);

// Using BatchedPromise as a means to cache resolves/rejections, even though there is no actual input.
const getAvatarAssetRules = () => _getAvatarAssetRules(0);

const wearItem = async (assetId: number) => {
  const authenticatedUser = await getAuthenticatedUser();
  if (!authenticatedUser) {
    throw new Error('Not logged in');
  }

  // Use set-wearing-assets instead of wear because it will allow more than the limit
  const currentAssets = await getAvatarAssets(authenticatedUser.id);
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

export { getAvatarAssets, getAvatarAssetRules, wearItem, removeItem };
