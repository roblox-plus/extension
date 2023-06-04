import { getIdFromUrl } from 'roblox';
import '../../../css/pages/groups.scss';
import { addTradeLinks, tradeGroupId } from './trade';

const groupId = getIdFromUrl(new URL(location.href));
if (groupId === tradeGroupId) {
  setInterval(async () => {
    addTradeLinks();
  }, 500);
}
