import authenticatedUser from '../../utils/authenticatedUser';
import '../../../css/pages/inventory.scss';
import showDeleteItemModal from './showDeleteItemModal';

const inventoryData = document.querySelector('inventory');
const userId = Number(inventoryData?.getAttribute('user-id'));
const showDeleteButtonTabs = ['models', 'audio', 'meshparts', 'decals'];

const getItemName = (itemCardContainer: HTMLElement | null | undefined) => {
  const itemName = itemCardContainer?.querySelector('.item-card-name');
  if (itemName instanceof HTMLElement) {
    return itemName.innerText;
  }

  return '';
};

const tryShowRemoveButton = (thumbnail: HTMLElement) => {
  if (
    !thumbnail.classList.contains('thumbnail-2d-container') ||
    thumbnail.getAttribute('thumbnail-type') !== 'Asset'
  ) {
    return;
  }

  const currentTabSelection = location.hash.split('/').pop() || '';
  if (!showDeleteButtonTabs.includes(currentTabSelection)) {
    return;
  }

  const assetId = Number(thumbnail.getAttribute('thumbnail-target-id'));
  if (isNaN(assetId) || assetId < 1) {
    return;
  }

  const itemCardContainer =
    thumbnail.parentElement?.parentElement?.parentElement?.parentElement;
  const itemName = getItemName(itemCardContainer);

  const removeButton = document.createElement('button');
  removeButton.setAttribute('type', 'button');
  removeButton.setAttribute('class', 'rplus-remove-button icon-alert');
  itemCardContainer?.appendChild(removeButton);

  removeButton.addEventListener('click', async () => {
    itemCardContainer?.parentElement?.classList.add('rplus-item-deleted');

    try {
      const deleted = await showDeleteItemModal(assetId, itemName);
      if (!deleted) {
        // We did not actually delete the item, remove the class.
        itemCardContainer?.parentElement?.classList.remove(
          'rplus-item-deleted'
        );
      }
    } catch (e) {
      console.error('Item deletion modal failed, horribly.', e);
    }
  });
};

if (userId === authenticatedUser?.id) {
  setInterval(() => {
    const currentTime = `${+new Date()}`;
    document
      .querySelectorAll(
        `#assetsItems .thumbnail-2d-container[thumbnail-type='Asset']:not([rplus-remove-button-activated])`
      )
      .forEach((e) => {
        if (e instanceof HTMLElement) {
          e.setAttribute('rplus-remove-button-activated', currentTime);
          tryShowRemoveButton(e);
        }
      });
  }, 500);
}
