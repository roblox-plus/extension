import ReactDOM from 'react-dom/client';
import { isPremiumUser } from '../../../services/premium';
import { getToggleSettingValue } from '../../../services/settings';
import { getAuthenticatedUser } from '../../../services/users';
import mountPremiumPayoutsSummary from './premium-payouts';

let mount: ReactDOM.Root | undefined = undefined;

setInterval(async () => {
  try {
    const universeIdMatch = location.pathname.match(
      /^\/dashboard\/creations\/experiences\/(\d+)\/stats/
    );
    const universeId = universeIdMatch && Number(universeIdMatch[1]);

    if (universeId) {
      const authenticatedUser = await getAuthenticatedUser();
      if (!authenticatedUser) {
        // well this shouldn't be possible.. oh well
        return;
      }

      const isPremium = await isPremiumUser(authenticatedUser.id);
      if (!isPremium) {
        // No premium, no feature.
        return;
      }

      const enabled = await getToggleSettingValue('premiumPayoutsSummary');
      if (!enabled) {
        // Feature is not enabled, do nothing.
        return;
      }

      // Thanks, I hate it.
      const premiumVisitsHeader = document.querySelector(
        '.chart-section>p'
      ) as HTMLElement;
      if (premiumVisitsHeader?.innerText?.includes('Premium')) {
        const tabContent =
          premiumVisitsHeader.parentElement?.parentElement?.parentElement;
        if (!tabContent || tabContent.getAttribute('rplus')) {
          // Can't attach, or we're already attached.
          return;
        }

        // Ensure we don't double-initialize
        tabContent.setAttribute('rplus', `${+new Date()}`);

        mount?.unmount();
        mount = mountPremiumPayoutsSummary(tabContent, universeId);
      }
    } else if (mount) {
      mount.unmount();
      mount = undefined;
    }
  } catch (err) {
    console.warn('Unhandled error in the developer-stats check', err);
  }
}, 1000);
