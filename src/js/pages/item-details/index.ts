import '../../../css/pages/item-details.scss';
import { getAssetSalesCount } from '../../services/assets';
import { getTranslationResource } from '../../services/localization';
import { getToggleSettingValue } from '../../services/settings';
import { assetId, isLimited, isOwnCreatedItem } from './details';
import { createStat } from './stats';

if (isOwnCreatedItem && !isLimited) {
  getToggleSettingValue('itemSalesCounter')
    .then((enabled) => {
      if (!enabled) {
        return;
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
