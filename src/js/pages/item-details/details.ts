import AssetType from '../../enums/assetType';
import { getIdFromUrl } from '../../utils/linkify';

const itemContainer = document.querySelector('#item-container');

const parseCreatorId = () => {
  const creatorId = Number(
    itemContainer?.getAttribute('data-expected-seller-id')
  );

  if (creatorId) {
    return creatorId;
  }

  const creatorUrl = document
    .querySelector('.item-name-container a.text-name')
    ?.getAttribute('href');
  if (creatorUrl) {
    return getIdFromUrl(new URL(creatorUrl));
  }

  return NaN;
};

const creatorId = parseCreatorId();

const assetId = Number(itemContainer?.getAttribute('data-item-id'));

const assetType = Number(
  itemContainer?.getAttribute('data-asset-type-id')
) as AssetType;

// These elements aren't guaranteed to be on the page when it loads.
const isOwnedAvatarAsset = (): boolean => {
  if (document.querySelector('#edit-avatar-button')) {
    // option to edit avatar, we definitely own this one
    return true;
  }

  if (
    document.querySelectorAll(
      '#item-details-limited-inventory-container .resale-button'
    ).length > 0
  ) {
    // it's a limited, and we own a copy
    // and all limiteds are avatar assets
    return true;
  }

  // nope.
  return false;
};

const isOwnCreatedItem = !!document.querySelector('#configure-item');
const isOwnedStudioItem = !!document.querySelector('#try-in-studio-button');
const isLimited = !!document.querySelector('asset-resale-pane');

export {
  assetId,
  assetType,
  creatorId,
  isOwnCreatedItem,
  isOwnedAvatarAsset,
  isOwnedStudioItem,
  isLimited,
};
