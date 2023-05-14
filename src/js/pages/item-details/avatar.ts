import authenticatedUser from '../../utils/authenticatedUser';
import {
  getAvatarAssetRules,
  getAvatarAssets,
  removeItem,
  wearItem,
} from '../../services/avatar';
import {
  showErrorBanner,
  showSuccessBanner,
} from '../../components/system-feedback';
import { getTranslationResource } from '../../services/localization';
import { assetId, assetType } from './details';

const initializeContextMenu = (
  createContextMenuButton: (text: string) => HTMLButtonElement
) => {
  if (!authenticatedUser) {
    return;
  }

  getAvatarAssetRules()
    .then(async (avatarRules) => {
      const avatarRule = avatarRules.find(
        (rule) => rule.assetType === assetType
      );

      if (!avatarRule) {
        // Not an avatar asset.
        return;
      }

      const assets = await getAvatarAssets(authenticatedUser?.id || 0);
      const isWearing = !!assets.find((a) => a.id === assetId);

      if (isWearing) {
        // Already wearing the item
        const removeText = await getTranslationResource(
          'Feature.Item',
          'Action.TakeOff'
        );

        const removeItemButton = createContextMenuButton(removeText);
        removeItemButton.addEventListener('click', async () => {
          try {
            await removeItem(assetId);
            showSuccessBanner('Item removed from avatar', 5 * 1000);
          } catch (e) {
            console.error('Failed to remove item', e);
            showErrorBanner('Failed to remove item from avatar.', 5 * 1000);
          }
        });
      } else {
        // Not wearing the item
        const wearButtonText = await getTranslationResource(
          'Feature.Item',
          'Action.Wear'
        );

        const wearItemButton = createContextMenuButton(wearButtonText);
        wearItemButton.addEventListener('click', async () => {
          if (!authenticatedUser) {
            return;
          }

          try {
            await wearItem(assetId, authenticatedUser.id);
            showSuccessBanner(`Item added to avatar`, 5 * 1000);
          } catch (e) {
            console.error('Failed to wear item', e);
            showErrorBanner('Failed to wear item on avatar.', 5 * 1000);
          }
        });
      }
    })
    .catch((err) => {
      console.error('Failed to load avatar rules', err);
    });
};

export { initializeContextMenu };
