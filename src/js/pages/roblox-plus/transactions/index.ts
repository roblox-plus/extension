import { AssetType, ThumbnailState } from 'roblox';
import {
  getAssetThumbnail,
  getDeveloperProductIcon,
  getGameIcon,
  getGamePassIcon,
} from '../../../services/thumbnails';
import {
  emailGroupTransactionSales,
  emailUserTransactionSales,
} from '../../../services/transactions';
import { Thumbnail } from 'roblox';

const respond = (success: boolean, message: string) => {
  window.postMessage({
    type: 'download-transactions',
    success,
    message,
  });
};

window.addEventListener('message', (event) => {
  const targetId = Number(event.data.targetId);
  if (
    event.data.type === 'download-transactions' &&
    targetId &&
    event.data.targetType
  ) {
    const startDate = new Date(event.data.startDate);
    const endDate = new Date(event.data.endDate);

    console.log(
      'Received request to download transactions',
      event.data.targetType,
      targetId,
      startDate,
      endDate
    );

    switch (event.data.targetType) {
      case 'User':
        emailUserTransactionSales(targetId, startDate, endDate)
          .then(() => {
            respond(
              true,
              'Please check your email for your transactions, then come back to this page to upload the CSV.'
            );
          })
          .catch((err) => {
            console.error('Failed to email user transactions', err);
            respond(
              false,
              'An unexpected error occurred while attempting to email your transactions. Please try again.'
            );
          });

        return;
      case 'Group':
        emailGroupTransactionSales(targetId, startDate, endDate)
          .then(() => {
            respond(
              true,
              'Please check your email for your group transactions, then come back to this page to upload the CSV.'
            );
          })
          .catch((err) => {
            console.error('Failed to email group transactions', err);
            respond(
              false,
              'An unexpected error occurred while attempting to email your group transactions. Please ensure you have access to the transactions for this group, and try again.'
            );
          });

        return;
      default:
        respond(false, "we... don't know what happened here.");
        return;
    }
  }
});

setInterval(() => {
  document
    .querySelectorAll('.rplus-item-card-media:not([rplus])')
    .forEach((element) => {
      if (!(element instanceof HTMLElement)) {
        return;
      }

      element.setAttribute('rplus', `${+new Date()}`);

      const itemType = element.dataset.itemType;
      const itemId = Number(element.dataset.itemId);
      if (typeof itemType !== 'string' || !itemType || !itemId) {
        return;
      }

      const thumbnailLoaded = (thumbnail: Thumbnail) => {
        if (thumbnail.state !== ThumbnailState.Completed) {
          return;
        }

        const img = document.createElement('img');
        img.src = thumbnail.imageUrl;
        element.appendChild(img);
      };

      const thumbnailFailed = (err: any) => {
        console.warn(
          'Failed to load image for transaction card',
          itemType,
          itemId,
          err
        );
      };

      if (itemType === 'Game Pass') {
        getGamePassIcon(itemId).then(thumbnailLoaded).catch(thumbnailFailed);
      } else if (itemType === 'Developer Product') {
        getDeveloperProductIcon(itemId)
          .then(thumbnailLoaded)
          .catch(thumbnailFailed);
      } else if (itemType === 'Private Server Product') {
        getGameIcon(itemId).then(thumbnailLoaded).catch(thumbnailFailed);
      } else if (Object.keys(AssetType).includes(itemType)) {
        getAssetThumbnail(itemId).then(thumbnailLoaded).catch(thumbnailFailed);
      }
    });
}, 500);
