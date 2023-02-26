import { getGamePassSaleCount } from '../../services/gamePassService';
import { getTranslationResource } from '../../services/localizationService';
import { createStat } from '../item-details/stats';
import { gamePassId, isOwnCreatedItem } from './details';

if (isOwnCreatedItem) {
  getGamePassSaleCount(gamePassId)
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
