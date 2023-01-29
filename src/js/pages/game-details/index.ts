import { getBadgeAwardedDate } from '../../services/badgesService';
import { getSettingValue } from '../../services/settingsService';
import authenticatedUser from '../../utils/authenticatedUser';
import '../../../css/pages/game-details.scss';

const badgesCheck = async () => {
  if (!authenticatedUser) {
    return;
  }

  const enabled = await getSettingValue('badge-award-dates-enabled');
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

const updateVoteTitle = (
  upvoteSpan: Element | null,
  downvoteSpan: Element | null
) => {
  const upvoteCount = Number(upvoteSpan?.getAttribute('title'));
  const downvoteCount = Number(downvoteSpan?.getAttribute('title'));
  if (isNaN(upvoteCount) || isNaN(downvoteCount)) {
    return;
  }

  upvoteSpan?.setAttribute('title', upvoteCount.toLocaleString());
  downvoteSpan?.setAttribute('title', downvoteCount.toLocaleString());

  const percentage =
    downvoteCount < 1
      ? 100
      : (100 / (upvoteCount + downvoteCount)) * upvoteCount;

  if (upvoteSpan?.parentElement?.parentElement) {
    const percentageSpan = document.createElement('span');
    percentageSpan.classList.add('count-middle');
    percentageSpan.setAttribute(
      'title',
      `${
        percentage === 100 ? 100 : percentage.toFixed(3)
      }% of players recommend this game`
    );
    percentageSpan.innerText = `${Math.floor(percentage)}%`;

    upvoteSpan.parentElement.after(percentageSpan);
  }
};

setInterval(async () => {
  updateVoteTitle(
    document.querySelector('#vote-up-text'),
    document.querySelector('#vote-down-text')
  );

  try {
    await badgesCheck();
  } catch (e) {
    console.error(e);
  }
}, 500);
