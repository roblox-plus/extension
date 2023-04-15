// Features for the group Trade.
// https://www.roblox.com/groups/650266/Trade
import { getTranslationResource } from '../../services/localizationService';
import { getIdFromUrl } from '../../utils/linkify';

const tradeGroupId = 650266;

const addTradeLinks = () => {
  const currentTime = `${+new Date()}`;
  document
    .querySelectorAll(
      '.group-comments .comment.list-item .text-date-hint:not([rplus-trade-link])'
    )
    .forEach(async (footer) => {
      try {
        if (footer instanceof HTMLElement) {
          footer.setAttribute('rplus-trade-link', currentTime);

          const posterLink = footer.parentElement
            ?.querySelector('a.text-name')
            ?.getAttribute('href');
          if (!posterLink) {
            return;
          }

          const posterUserId = getIdFromUrl(new URL(posterLink));
          if (isNaN(posterUserId)) {
            return;
          }

          const tradeText = await getTranslationResource(
            'Feature.Profile',
            'Action.Trade'
          );

          const tradeLink = document.createElement('a');
          tradeLink.setAttribute('href', `/users/${posterUserId}/trade`);
          tradeLink.setAttribute('class', 'text-link');
          tradeLink.innerText = tradeText;

          footer.insertAdjacentText('beforeend', ' | ');
          footer.appendChild(tradeLink);
        }
      } catch (e) {
        console.warn('Failed to add trade link', e);
      }
    });
};

export { addTradeLinks, tradeGroupId };
