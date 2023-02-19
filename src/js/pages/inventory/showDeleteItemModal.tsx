import { showConfirmationModal } from '../../components/modal';
import {
  showErrorBanner,
  showSuccessBanner,
} from '../../components/system-feedback';
import { deleteAsset } from '../../services/inventoryService';
import { getTranslationResource } from '../../services/localizationService';
import { getLibraryLink } from '../../utils/linkify';

export default async (assetId: number, itemName: string): Promise<boolean> => {
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
  const successBannerText = await getTranslationResource(
    'Feature.Item',
    'Response.RemovedFromInventory'
  );
  const errorBannerText = await getTranslationResource(
    'Feature.Item',
    'Response.FailedToDeleteFromInventory'
  );

  const confirmed = await showConfirmationModal({
    title,
    body: (
      <p className="body-text text-description">
        {body}
        <br />
        <a href={getLibraryLink(assetId, itemName).href} className="text-link">
          {itemName}
        </a>
      </p>
    ),
    confirmClass: 'alert',
    confirmText,
    cancelText,
  });

  if (!confirmed) {
    return false;
  }

  try {
    await deleteAsset(assetId);
    showSuccessBanner(successBannerText, 5000);
    return true;
  } catch (e) {
    console.error('Failed to delete item from inventory', assetId, itemName, e);
    showErrorBanner(errorBannerText, 5000);
    return false;
  }
};
