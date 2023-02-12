import authenticatedUser from '../../utils/authenticatedUser';
import AssetType from '../../enums/assetType';
import { initializeContextMenu } from './avatar';
import { assetId, assetType, isOwnedAvatarAsset } from './details';

// If the item is an owned avatar asset, attempt to add the wear + remove button to the context menu, when it opens.
if (
  isOwnedAvatarAsset &&
  assetType !== AssetType.Emote &&
  !isNaN(assetId) &&
  authenticatedUser
) {
  window.addEventListener('DOMNodeInserted', (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    if (
      event.target.classList.contains('popover') &&
      event.target.parentElement?.id === 'item-context-menu'
    ) {
      const contextMenu =
        event.target.parentElement.querySelector('ul.dropdown-menu');
      if (contextMenu instanceof HTMLElement) {
        initializeContextMenu(contextMenu);
      }
    }
  });
}
