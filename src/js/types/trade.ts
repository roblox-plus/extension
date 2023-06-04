import { TradeStatusType, User } from 'roblox';
import TradeOffer from './trade-offer';

type Trade = {
  // The ID of the trade.
  id: number;

  // The trade status type.
  type: TradeStatusType;

  // The trade status.
  status: string;

  // The trade partner user.
  tradePartner: User;

  // The offer on the side of the trade partner.
  partnerOffer: TradeOffer;

  // The trade offer on the side of the authenticated user.
  authenticatedUserOffer: TradeOffer;
};

export default Trade;
