type OwnedLimitedAsset = {
  // The ID of the asset.
  id: number;

  // The name of the asset.
  name: string;

  // The ID of the ownership record.
  userAssetId: number;

  // The item serial number.
  serialNumber: number;

  // The recent average price of the item.
  recentAveragePrice: number;
};

export default OwnedLimitedAsset;
