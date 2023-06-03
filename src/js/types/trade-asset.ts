type TradeAsset = {
  // The ID of the asset involved in the trade.
  id: number;

  // The name of the asset.
  name: string;

  // The ownership record ID.
  userAssetId: number;

  // The recent average price of the asset.
  recentAveragePrice: number;
};

export default TradeAsset;
