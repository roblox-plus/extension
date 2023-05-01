import ReactDOM from 'react-dom/client';
import PremiumPayoutsSummary from './app';

export default (container: HTMLElement, universeId: number): ReactDOM.Root => {
  const summaryContaienr = document.createElement('div');
  summaryContaienr.setAttribute('class', 'rplus-premium-payouts-summary');
  container.appendChild(summaryContaienr);

  const summaryRoot = ReactDOM.createRoot(summaryContaienr);
  summaryRoot.render(
    <PremiumPayoutsSummary container={container} universeId={universeId} />
  );

  return summaryRoot;
};
