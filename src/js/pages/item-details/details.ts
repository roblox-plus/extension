import AssetType from '../../enums/assetType';
import { getIdFromUrl } from '../../utils/linkify';
import wait from '../../utils/wait';

const itemContainer = document.querySelector('#item-container');

type ItemDetails = {
  creatorId: number;
};

const parseCreatorId = () => {
  // It's possible this won't exist when the page loads.
  const creatorUrl = document
    .querySelector('.item-name-container a.text-name')
    ?.getAttribute('href');

  if (creatorUrl) {
    return getIdFromUrl(new URL(creatorUrl));
  }

  return NaN;
};

const waitForCreatorId = async () => {
  while (true) {
    const creatorId = parseCreatorId();
    if (creatorId) {
      return creatorId;
    }

    await wait(500);
  }
};

const getDetails = (): Promise<ItemDetails> => {
  return new Promise(async (resolve, reject) => {
    const creatorId = await waitForCreatorId();
    resolve({
      creatorId,
    });
  });
};

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
  parseCreatorId,
  getDetails,
  isOwnCreatedItem,
  isOwnedAvatarAsset,
  isOwnedStudioItem,
  isLimited,
};
