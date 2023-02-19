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

const isOwnedAvatarAsset = !!document.querySelector(
  '#sell,#take-off-sale,#edit-avatar-button'
);

const isOwnCreatedItem = !!document.querySelector('#configure-item');
const isOwnedStudioItem = !!document.querySelector('#try-in-studio-button');

export {
  assetId,
  assetType,
  creatorId,
  isOwnCreatedItem,
  isOwnedAvatarAsset,
  isOwnedStudioItem,
};
