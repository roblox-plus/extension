import authenticatedUser from '../../utils/authenticatedUser';
import '../../../css/pages/inventory.scss';
import { showConfirmationModal } from '../../components/modal';
import { getTranslationResource } from '../../services/localizationService';

const inventoryData = document.querySelector('inventory');
const userId = Number(inventoryData?.getAttribute('user-id'));
const showDeleteButtonTabs = ['models', 'audio', 'meshparts', 'decals'];

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

  const removeButton = document.createElement('button');
  removeButton.setAttribute('type', 'button');
  removeButton.setAttribute('class', 'rplus-remove-button icon-alert');
  thumbnail.parentElement?.parentElement?.parentElement?.parentElement?.appendChild(
    removeButton
  );

  removeButton.addEventListener('click', async () => {
    try {
      const title = await getTranslationResource(
        'Feature.Item',
        'Label.DeleteItem'
      );
      const body = await getTranslationResource(
        'Feature.Item',
        'Label.DeleteFromInventoryConfirm'
      );
      const confirmText = await getTranslationResource(
        'CreatorDashboard.Controls',
        'Action.Delete'
      );
      const cancelText = await getTranslationResource(
        'CreatorDashboard.Controls',
        'Action.Cancel'
      );

      showConfirmationModal({
        title,
        body,
        confirmText,
        cancelText,
      })
        .then((confirmed) => {
          console.log('Delete?', confirmed);
        })
        .catch((err) => {
          console.error('Failed to complete confirmation modal.', err);
        });
    } catch (e) {
      console.error('Failed to open deletion confirmation modal.', e);
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
