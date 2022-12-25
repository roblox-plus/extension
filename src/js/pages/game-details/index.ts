import { getBadgeAwardedDate } from '../../services/badgesService';
import { getAuthenticatedUser } from '../../services/usersService';
import User from '../../types/user';
import '../../../css/pages/game-details.scss';

const badgesCheck = (authenticatedUser: User) => {
  const awardedAttribute = 'rplus-awarded-date';
  document
    .querySelectorAll(
      `thumbnail-2d>span[thumbnail-type='BadgeIcon']:not([${awardedAttribute}])`
    )
    .forEach((badgeIcon) => {
      badgeIcon.setAttribute(awardedAttribute, '0');

      const badgeId = Number(badgeIcon.getAttribute('thumbnail-target-id'));
      if (isNaN(badgeId)) {
        return;
      }

      getBadgeAwardedDate(badgeId, authenticatedUser.id)
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

const pageLoaded = (authenticatedUser: User) => {
  setInterval(() => badgesCheck(authenticatedUser), 1000);
};

getAuthenticatedUser()
  .then((authenticatedUser) => {
    if (!authenticatedUser) {
      return;
    }

    pageLoaded(authenticatedUser);
  })
  .catch(console.error);
