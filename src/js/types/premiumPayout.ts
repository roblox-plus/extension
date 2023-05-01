import PremiumPayoutType from '../enums/premiumPayoutType';

type PremiumPayout = {
  // ?
  engagementScore: number;

  // The amount of Robux earned by the premium payout.
  payoutInRobux: number;

  // The projected payout type.
  payoutType: PremiumPayoutType;

  // The date the payout is for.
  date: string;
};

export default PremiumPayout;
