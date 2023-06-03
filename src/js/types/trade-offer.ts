import TradeAsset from './trade-asset';

type TradeOffer = {
  // The amount of Robux that are involved in the offer.
  robux: number;

  // The assets involved in the offer.
  assets: TradeAsset[];
};

export default TradeOffer;
