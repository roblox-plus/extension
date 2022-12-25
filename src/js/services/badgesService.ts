import { BatchedPromise, translateOutput } from '../utils/batchedPromise';

// HACK: "Internal" get badge awarded date method is a hack to batch by user id, then batch badges together.
const badgeAwardPromises: {
  [i: number]: (badgeId: number) => Promise<Date | null>;
} = {};

type AwardedBadge = {
  // The ID of the badge that was awarded to the user.
  badgeId: number;

  // The ISO 8601 foramtted date for when the badge was awarded.
  awardedDate: string;
};

const _getBadgeAwardedDate = (
  userId: number
): ((badgeId: number) => Promise<Date | null>) => {
  if (badgeAwardPromises[userId]) {
    return badgeAwardPromises[userId];
  }

  return (badgeAwardPromises[userId] = BatchedPromise<Date | null>(
    {
      cacheDuration: 60 * 1000,
    },
    async (badgeIds) => {
      const response = await fetch(
        `https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates?badgeIds=${badgeIds.join(
          ','
        )}`
      );
      const result = await response.json();

      return translateOutput(
        badgeIds,
        result.data,
        (badge: AwardedBadge) => badge.badgeId,
        (badge: AwardedBadge) => (badge ? new Date(badge.awardedDate) : null)
      );
    }
  ));
};

const getBadgeAwardedDate = async (badgeId: number, userId: number) => {
  return _getBadgeAwardedDate(userId)(badgeId);
};

export { getBadgeAwardedDate };
