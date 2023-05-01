import ReactDOM from 'react-dom/client';
import mountPremiumPayoutsSummary from './premium-payouts';

let mount: ReactDOM.Root | undefined = undefined;

setInterval(() => {
  const universeIdMatch = location.pathname.match(
    /^\/dashboard\/creations\/experiences\/(\d+)\/stats/
  );
  const universeId = universeIdMatch && Number(universeIdMatch[1]);

  if (universeId) {
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
}, 1000);
