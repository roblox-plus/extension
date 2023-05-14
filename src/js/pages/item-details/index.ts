import '../../../css/pages/item-details.scss';
import { getAssetSalesCount } from '../../services/assets';
import { getTranslationResource } from '../../services/localization';
import { getToggleSettingValue } from '../../services/settings';
import wait from '../../utils/wait';
import {
  assetId,
  parseCreatorId,
  isLimited,
  isOwnCreatedItem,
  isOwnedAvatarAsset,
  assetType,
} from './details';
import { createStat } from './stats';
import calculateRecentAveragePriceAfterSale from './calculate-rap-after-sale';
import { initializeContextMenu } from './context-menu';
import {
  disabledAssetTypes as assetDependenciesDisabledAssetTypes,
  render as renderAssetDependencies,
} from './asset-dependencies';
import authenticatedUser from '../../utils/authenticatedUser';
import { isOwnedStudioItem } from './details';

// Add sales counter onto the page.
if (isOwnCreatedItem && !isLimited) {
  getToggleSettingValue('itemSalesCounter')
    .then(async (enabled) => {
      if (!enabled) {
        return;
      }

      while (!document.getElementById('item-details')) {
        // Wait until the item details container is loaded.
        await wait(250);
      }

      getAssetSalesCount(assetId)
        .then(async (saleCount) => {
          if (isNaN(saleCount)) {
            return;
          }

          try {
            const salesLabel = await getTranslationResource(
              'CreatorDashboard.Creations',
              'Heading.Sales'
            );

            createStat(salesLabel, saleCount.toLocaleString());
          } catch (e) {
            console.error('Failed to render sales label', e);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch sale count', err);
        });
    })
    .catch((err) => {
      console.warn('Failed to check if sale counter setting was enabled.', err);
    });
}

// Add features for limited items.
if (isLimited) {
  setInterval(() => {
    const currentAveragePrice = Number(
      document
        .getElementById('item-average-price')
        ?.innerText?.replace(/\D+/g, '')
    );
    if (!currentAveragePrice) {
      return;
    }

    document
      .querySelectorAll('.reseller-price-container:not([rplus])')
      .forEach((priceContainer) => {
        if (!(priceContainer instanceof HTMLElement)) {
          return;
        }

        priceContainer.setAttribute('rplus', `${+new Date()}`);

        const price = Number(priceContainer.innerText.replace(/\D+/g, ''));
        if (!price) {
          return;
        }

        const rapAfterSale = calculateRecentAveragePriceAfterSale(
          currentAveragePrice,
          price
        );
        priceContainer.setAttribute(
          'title',
          `If this sells, the average price of the item should be approximately R\$${rapAfterSale.toLocaleString()}`
        );
      });
  }, 1000);
}

// Asset Dependencies
if (!assetDependenciesDisabledAssetTypes.includes(assetType)) {
  getToggleSettingValue('asset-dependency-list')
    .then(async (enabled) => {
      const allowed = async (): Promise<boolean> => {
        if (isOwnCreatedItem || isOwnedStudioItem) {
          return true;
        }

        while (true) {
          const creatorId = parseCreatorId();
          if (isNaN(creatorId)) {
            await wait(500);
            continue;
          }

          return creatorId === 1;
        }
      };

      const parentContainer = document.getElementById('item-container');
      if (!parentContainer || !enabled) {
        return;
      }

      const isAllowed = await allowed();
      if (!isAllowed) {
        return;
      }

      const container = document.createElement('div');
      container.setAttribute('id', 'rplus-asset-dependencies');

      const commentsContainer = document.getElementById(
        'AjaxCommentsContainer'
      );
      if (commentsContainer?.parentElement) {
        commentsContainer.parentElement.before(container);
      } else {
        parentContainer.appendChild(container);
      }

      renderAssetDependencies(container, assetId);
    })
    .catch((err) => {
      console.error('Failed to render asset dependency list', err);
    });
}

// Listen for the context menu to open.
window.addEventListener('DOMNodeInserted', async (event) => {
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
      try {
        await initializeContextMenu(contextMenu);
      } catch (e) {
        console.warn('Unexpected error opening context menu', e);
      }
    }
  }
});
