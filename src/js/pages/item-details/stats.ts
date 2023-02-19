import { getAssetSaleCount } from '../../services/catalogService';
import { getTranslationResource } from '../../services/localizationService';
import { assetId, isOwnCreatedItem } from './details';

const createStat = (label: string, value: string) => {
  const itemTypeStat = document.querySelector(
    '.item-details .item-type-field-container'
  );
  if (!(itemTypeStat instanceof HTMLElement)) {
    return;
  }

  const container = document.createElement('div');
  container.setAttribute('class', 'clearfix item-field-container');

  const labelElement = document.createElement('div');
  labelElement.setAttribute(
    'class',
    'text-subheader text-label text-overflow field-label'
  );
  labelElement.innerText = label;

  const valueElement = document.createElement('span');
  valueElement.setAttribute('class', 'text-label');
  valueElement.innerText = value;

  container.appendChild(labelElement);
  container.appendChild(valueElement);
  itemTypeStat.after(container);
};

if (isOwnCreatedItem) {
  getAssetSaleCount(assetId)
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
}

export { createStat };
