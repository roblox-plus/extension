export {};
import { render as renderRobuxHistory } from './robux-history';
import { getToggleSettingValue } from '../../services/settings';
import { isPremiumUser } from '../../services/premium';
import authenticatedUser from '../../utils/authenticatedUser';

getToggleSettingValue('robuxHistoryEnabled')
  .then(async (enabled) => {
    if (!authenticatedUser || !enabled) {
      return;
    }

    const transactionsContainer = document.getElementById(
      'transactions-page-container'
    );
    if (!transactionsContainer) {
      return;
    }

    const isPremium = await isPremiumUser(authenticatedUser?.id);
    if (!isPremium) {
      return;
    }

    const container = document.createElement('div');
    container.setAttribute('id', 'rplus-robux-history');
    transactionsContainer.after(container);

    renderRobuxHistory(container, authenticatedUser.id);
  })
  .catch((err) => {
    console.warn('Failed to render Robux history chart.', err);
  });
