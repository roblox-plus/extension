import { getLimitedInventory } from '../../services/inventory';
import { getToggleSettingValue } from '../../services/settings';
import OwnedLimitedAsset from '../../types/ownedLimitedAsset';
import abbreviateNumber from '../../utils/abbreviateNumber';
import { user } from './details';

const headerDetails = document.querySelector('.header-details>ul.details-info');

const createStat = (labelText: string, valueText: string): HTMLElement => {
  const container = document.createElement('li');

  const label = document.createElement('div');
  label.setAttribute('class', 'text-label font-caption-header');
  label.innerText = labelText;

  const valueLink = document.createElement('a');
  valueLink.setAttribute('class', 'text-name');

  const value = document.createElement('span');
  value.setAttribute('class', 'font-header-2');
  value.innerText = valueText;

  container.appendChild(label);
  container.appendChild(valueLink);
  valueLink.appendChild(value);
  headerDetails?.appendChild(container);

  return value;
};

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
          console.log('bloop', user);
          //await viewUser(user);
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
