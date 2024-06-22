import { getIdFromUrl } from 'roblox';
import { getBadgeAwardDate } from '../../services/badges';
import { getToggleSettingValue } from '../../services/settings';
import authenticatedUser from '../../utils/authenticatedUser';

const addBadgeAwardedDates = async () => {
  if (!authenticatedUser) {
    return;
  }

  const enabled = await getToggleSettingValue('badgeAchievementDatesEnabled');
  if (!enabled) {
    return;
  }

  const awardedAttribute = 'rplus-awarded-date';
  document
    .querySelectorAll(
      `.thumbnail-2d-container.badge-image-container:not([${awardedAttribute}])`
    )
    .forEach((badgeIcon) => {
      if (!authenticatedUser) {
        return;
      }

      badgeIcon.setAttribute(awardedAttribute, '0');

      const badgeUrl = badgeIcon.parentElement?.getAttribute('href');
      const badgeId = badgeUrl ? getIdFromUrl(new URL(badgeUrl)) : NaN;
      if (isNaN(badgeId)) {
        return;
      }

      getBadgeAwardDate(authenticatedUser.id, badgeId)
        .then((awardedDate) => {
          if (!awardedDate) {
            return;
          }

          badgeIcon.setAttribute(
            awardedAttribute,
            awardedDate.getTime().toString()
          );

          const awardedDateLabel = document.createElement('span');
          awardedDateLabel.classList.add('rplus-awarded-date');
          awardedDateLabel.setAttribute(
            'title',
            `Awarded on ${awardedDate.toLocaleString()}`
          );
          awardedDateLabel.innerText = awardedDate.toLocaleDateString();
          badgeIcon.parentElement?.parentElement?.appendChild(awardedDateLabel);
        })
        .catch((err) => {
          console.error('Failed to check badge awarded date', badgeId, err);
        });
    });
};

export { addBadgeAwardedDates };
