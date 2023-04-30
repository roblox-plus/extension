import { getBadgeAwardDate } from '../../services/badges';
import { getToggleSettingValue } from '../../services/settings';
import authenticatedUser from '../../utils/authenticatedUser';
import { badgeId } from './details';

getToggleSettingValue('badgeAchievementDatesEnabled')
  .then(async (enabled) => {
    const checkmark = document.querySelector('.label-checkmark');
    const ownershipLabel = checkmark?.nextElementSibling;
    if (
      !ownershipLabel ||
      !(ownershipLabel instanceof HTMLElement) ||
      !enabled ||
      !authenticatedUser
    ) {
      return;
    }

    const awardedDate = await getBadgeAwardDate(authenticatedUser?.id, badgeId);
    if (!awardedDate) {
      // We're going to pretend this didn't happen.
      return;
    }

    ownershipLabel.innerText = `Awarded on ${awardedDate?.toLocaleDateString()}`;
    ownershipLabel.setAttribute(
      'title',
      `Awarded on ${awardedDate?.toLocaleString()}`
    );
  })
  .catch((err) => {
    console.warn('Failed to check badge award date', err);
  });
