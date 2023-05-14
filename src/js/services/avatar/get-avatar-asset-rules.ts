import AssetType from '../../enums/assetType';
import AvatarAssetRule from '../../types/avatar-asset-rule';
import { addListener, sendMessage } from '../message';

const messageDestination = 'avatarService.getAvatarRules';
let avatarAssetRules: AvatarAssetRule[] = [];

const getAvatarAssetRules = async (): Promise<AvatarAssetRule[]> => {
  return sendMessage(messageDestination, {});
};

const loadAvatarAssetRules = async (): Promise<AvatarAssetRule[]> => {
  const response = await fetch(`https://avatar.roblox.com/v1/avatar-rules`);

  if (!response.ok) {
    throw new Error(`Failed to load avatar rules (${response.status})`);
  }

  const result = await response.json();
  return result.wearableAssetTypes.map((rule: any) => {
    return {
      maxNumber: rule.maxNumber,
      assetType: rule.id as AssetType,
    };
  });
};

// Listen for messages sent to the service worker.
addListener(
  messageDestination,
  async () => {
    if (avatarAssetRules.length > 0) {
      return avatarAssetRules;
    }

    avatarAssetRules = await loadAvatarAssetRules();
    return avatarAssetRules;
  },
  {
    levelOfParallelism: 1,
  }
);

export default getAvatarAssetRules;
