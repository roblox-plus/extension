import { BatchedPromise, translateOutput } from '../utils/batchedPromise';
import xsrfFetch from '../utils/xsrfFetch';

// Checks whether or not the currently authenticated user is following a specified user ID.
const isAuthenticatedUserFollowing = BatchedPromise<boolean>(
  {
    maxBatchSize: 100,
    cacheDuration: 5 * 60 * 1000,
    backgroundServiceKey: 'userFollowingsService',
  },
  async (userIds) => {
    const response = await xsrfFetch(
      new URL('https://friends.roblox.com/v1/user/following-exists'),
      {
        method: 'POST',
        body: JSON.stringify({
          targetUserIds: userIds,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        'Failed to fetch following statuses for authenticated user'
      );
    }

    const result = await response.json();
    return translateOutput(
      userIds,
      result.followings,
      (followingResult: any) => followingResult.userId,
      (followingResult: any) => followingResult.isFollowing
    );
  }
);

export { isAuthenticatedUserFollowing };
