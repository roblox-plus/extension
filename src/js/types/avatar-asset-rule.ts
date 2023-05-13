import AssetType from '../enums/assetType';

type AvatarAssetRule = {
  // The max number of this item the avatar is allowed to wear at the same time.
  maxNumber: number;

  // The asset type the rule applies to.
  assetType: AssetType;
};

export default AvatarAssetRule;
