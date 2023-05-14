import AssetType from '../enums/assetType';

type AvatarAsset = {
  // The ID of the asset.
  id: number;

  // The name of the asset.
  name: string;

  // The asset type.
  assetType: AssetType;
};

export default AvatarAsset;
