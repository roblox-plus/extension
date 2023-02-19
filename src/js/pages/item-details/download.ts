import AssetType from '../../enums/assetType';
import { getAssetContentsUrl } from '../../services/assetContentService';
import { getTranslationResource } from '../../services/localizationService';
import { assetId, assetType, creatorId } from './details';

const createDownloadLink = async (): Promise<HTMLAnchorElement> => {
  const downloadUrl = await getAssetContentsUrl(assetId);
  const downloadText = await getTranslationResource(
    'Feature.UserAds',
    'Action.Download'
  );

  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', downloadUrl.href);
  downloadLink.download = 'download';
  downloadLink.innerText = downloadText;

  return downloadLink;
};

if (creatorId === 1) {
  switch (assetType) {
    case AssetType.Image:
    case AssetType.Mesh:
      const actionButton = document.querySelector(
        '.price-container .action-button>button'
      );

      if (
        // if we found the button
        !(actionButton instanceof HTMLButtonElement) ||
        // and the button is currently disabled
        !actionButton.disabled
      ) {
        break;
      }

      // then we can replace it with the download button
      createDownloadLink()
        .then((downloadLink) => {
          actionButton.classList.remove('btn-growth-lg');
          actionButton.classList.add('btn-control-lg');
          actionButton.innerText = '';
          actionButton.appendChild(downloadLink);
          actionButton.disabled = false;
        })
        .catch((err) => {
          console.error('Failed to create download link', err);
        });

      break;
  }
}

export { createDownloadLink };
