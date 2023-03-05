import PresenceType from '../enums/presenceType';
import UserPresence from '../types/userPresence';
import { BatchedPromise, translateOutput } from '../utils/batchedPromise';

const getPresenceType = (presenceType: number) => {
  switch (presenceType) {
    case 1:
      return PresenceType.Online;
    case 2:
      return PresenceType.Experience;
    case 3:
      return PresenceType.Studio;
    default:
      return PresenceType.Offline;
  }
};

const getLocationName = (presenceType: PresenceType, name: string) => {
  if (!name) {
    return '';
  }

  if (presenceType === PresenceType.Studio) {
    return name.replace(/^Studio\s+-\s*/, '');
  }

  return name;
};

const getUserPresence = BatchedPromise<UserPresence>(
  {
    cacheDuration: 60 * 1000,
    minWaitTime: 10 * 1000,
    backgroundServiceKey: 'presenceService.getUserPresence',
  },
  async (userIds) => {
    const response = await fetch(
      'https://presence.roblox.com/v1/presence/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds,
        }),
      }
    );

    const result = await response.json();
    return translateOutput(
      userIds,
      result.userPresences,
      (userPresence: any) => userPresence.userId,
      (presence: any): UserPresence => {
        const presenceType = getPresenceType(presence.userPresenceType);
        if (presence.placeId) {
          return {
            type: presenceType,
            location: {
              id: presence.placeId,
              name: getLocationName(presenceType, presence.lastLocation),
            },
          };
        }

        return {
          type: presenceType,
        };
      }
    );
  }
);

export { getUserPresence };
