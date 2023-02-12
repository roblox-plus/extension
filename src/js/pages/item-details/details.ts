import AssetType from '../../enums/assetType';

const itemContainer = document.querySelector('#item-container');

const assetId = Number(itemContainer?.getAttribute('data-item-id'));

const assetType = Number(
  itemContainer?.getAttribute('data-asset-type-id')
) as AssetType;

const isOwnedAvatarAsset = !!document.querySelector(
  '#sell,#take-off-sale,#edit-avatar-button'
);

export { assetId, assetType, isOwnedAvatarAsset };
