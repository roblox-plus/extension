import { Fragment, useEffect, useState } from 'react';
import ItemDetailsTab, { Tab } from './item-details-tab';
import {
  assetId,
  assetType,
  getDetails,
  isLimited,
  isOwnCreatedItem,
  isOwnedStudioItem,
} from '../details';
import AssetDependencies, {
  disabledAssetTypes as assetDependenciesDisabledAssetTypes,
} from '../asset-dependencies';
import { getTranslationResourceWithFallback } from '../../../services/localization';
import { getToggleSettingValue } from '../../../services/settings';

const assetResellersTab = document.querySelector('asset-resale-pane');

const isAssetDependenciesEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await getToggleSettingValue('asset-dependency-list');
    if (!enabled) {
      // Feature is not enabled.
      return false;
    }
  } catch (err) {
    console.warn('Failed to check asset dependencies enabled setting.');
    return false;
  }

  if (assetDependenciesDisabledAssetTypes.includes(assetType)) {
    // This asset type doesn't have dependencies.
    return false;
  }

  if (isOwnCreatedItem || isOwnedStudioItem) {
    // User created or owns this item, good enough.
    return true;
  }

  const itemDetails = await getDetails();
  if (itemDetails.creatorId === 1) {
    // Roblox created it, go ahead.
    return true;
  }

  // All else fails: no access to dependencies.
  return false;
};

const tryToggleActive = (container: HTMLElement | null, active: boolean) => {
  if (!container) {
    return;
  }

  container.classList.toggle('hidden', !active);
};

export default function ItemDetailsTabs() {
  const [activeTab, setActiveTab] = useState<ItemDetailsTab>(
    ItemDetailsTab.Primary
  );
  const [availableTabs, setAvailableTabs] = useState<Tab[]>([]);

  useEffect(() => {
    getDetails()
      .then(async (itemDetails) => {
        const tabs: Tab[] = [];

        if (assetResellersTab) {
          tabs.push({
            label: await getTranslationResourceWithFallback(
              'Feature.Catalog',
              'Heading.Resellers',
              'Resellers'
            ),
            value: ItemDetailsTab.Resellers,
          });
        } else {
          tabs.push({
            label: 'Primary',
            value: ItemDetailsTab.Primary,
          });
        }

        const assetDependenciesEnabled = await isAssetDependenciesEnabled();
        if (assetDependenciesEnabled) {
          tabs.push({
            label: 'Dependencies',
            value: ItemDetailsTab.Dependencies,
          });
        }

        if ((itemDetails.creatorId === 1 && isLimited) || isOwnCreatedItem) {
          /*
          tabs.push({
            label: 'Owners',
            value: ItemDetailsTab.Owners,
          });
          */
        }

        setAvailableTabs(tabs);
        setActiveTab(tabs[0].value);
      })
      .catch((err) => {
        console.error('Failed to load item details', err);
      });
  }, []);

  useEffect(() => {
    if (availableTabs.length < 2) {
      // Do nothing if we're not trying to add any tabs on the page.
      return;
    }

    if (assetResellersTab instanceof HTMLElement) {
      // Hide the resellers tab, when tab is not selected.
      tryToggleActive(
        assetResellersTab,
        activeTab === ItemDetailsTab.Resellers
      );
    } else {
      // Hide content that is considered for the "primary" tab, when not selected.
      tryToggleActive(
        document.getElementById('recommendations-container'),
        activeTab === ItemDetailsTab.Primary
      );

      tryToggleActive(
        document.getElementById('sponsored-catalog-items'),
        activeTab === ItemDetailsTab.Primary
      );
    }
  }, [activeTab, availableTabs]);

  if (availableTabs.length < 2) {
    // Only one tab to display? Do nothing.
    return <Fragment />;
  }

  return (
    <Fragment>
      <div className="rbx-tabs-horizontal">
        <ul className="nav nav-tabs">
          {availableTabs.map((tab) => {
            return (
              <li
                key={tab.value}
                className={`rbx-tab ${tab.value === activeTab ? 'active' : ''}`}
              >
                <button
                  className="rbx-tab-heading"
                  onClick={() => setActiveTab(tab.value)}
                >
                  <span className="text-lead">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {activeTab === ItemDetailsTab.Dependencies ? (
        <AssetDependencies assetId={assetId} />
      ) : null}
    </Fragment>
  );
}
