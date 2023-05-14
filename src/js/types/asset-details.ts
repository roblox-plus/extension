import AssetType from '../enums/assetType';

type AssetDetails = {
  id: number;

  name: string;

  type: AssetType;

  sales: number;
};

export default AssetDetails;
