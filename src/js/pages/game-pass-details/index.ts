import { getGamePassSaleCount } from '../../services/game-passes';
import { getTranslationResource } from '../../services/localization';
import { getToggleSettingValue } from '../../services/settings';
import { createStat } from '../item-details/stats';
import { gamePassId, isOwnCreatedItem } from './details';

if (isOwnCreatedItem) {
  getToggleSettingValue('itemSalesCounter')
    .then((enabled) => {
      if (!enabled) {
        return;
      }

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
    })
    .catch((err) => {
      console.warn('Failed to check if sale counter setting was enabled.', err);
    });
}

export { createStat };
