import { getLimitedInventory } from '../../services/inventory';
import { getToggleSettingValue } from '../../services/settings';
import OwnedLimitedAsset from '../../types/ownedLimitedAsset';
import abbreviateNumber from '../../utils/abbreviateNumber';
import { user } from './details';
import { createStat } from './utils';

const getTotalInventoryValue = (limitedInventory: OwnedLimitedAsset[]) => {
  let value = 0;
  limitedInventory.forEach((item) => {
    if (!isNaN(item.recentAveragePrice)) {
      value += item.recentAveragePrice;
    }
  });

  return value;
};

getToggleSettingValue('profileRAP')
  .then((enabled) => {
    if (!enabled) {
      return;
    }

    const inventoryValueStat = createStat('RAP', '...');
    inventoryValueStat.parentElement?.addEventListener(
      'click',
      async (event) => {
        event.preventDefault();

        try {
          window.RPlus.quickInfo.trigger(location.href);
        } catch (err) {
          console.error('Failed to open browser action', err, user);
        }
      }
    );

    getLimitedInventory(user.id)
      .then((limitedInventory) => {
        const value = getTotalInventoryValue(limitedInventory);
        inventoryValueStat.setAttribute(
          'title',
          `R\$${value.toLocaleString()}`
        );
        inventoryValueStat.innerText = abbreviateNumber(value);
      })
      .catch((err) => {
        console.error('Failed to load limited inventory', err);
        inventoryValueStat.parentElement?.parentElement?.remove();
      });
  })
  .catch((err) => {
    console.error('Failed to check RAP setting.', err);
  });

declare global {
  var RPlus: any;
}

export default {};
