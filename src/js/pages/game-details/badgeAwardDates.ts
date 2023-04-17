import { getBadgeAwardDate } from '../../services/badges';
import { getSettingValue } from '../../services/settings';
import authenticatedUser from '../../utils/authenticatedUser';

const addBadgeAwardedDates = async () => {
  if (!authenticatedUser) {
    return;
  }

  const enabled = await getSettingValue('badgeAchievementDatesEnabled');
  if (!enabled) {
    return;
  }

  const awardedAttribute = 'rplus-awarded-date';
  document
    .querySelectorAll(
      `thumbnail-2d>span[thumbnail-type='BadgeIcon']:not([${awardedAttribute}])`
    )
    .forEach((badgeIcon) => {
      if (!authenticatedUser) {
        return;
      }

      badgeIcon.setAttribute(awardedAttribute, '0');

      const badgeId = Number(badgeIcon.getAttribute('thumbnail-target-id'));
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
          badgeIcon.appendChild(awardedDateLabel);
        })
        .catch((err) => {
          console.error('Failed to check badge awarded date', badgeId, err);
        });
    });
};

export { addBadgeAwardedDates };
