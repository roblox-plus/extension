import User from '../types/user';
import { BatchedPromise } from '../utils/batchedPromise';

// Fetches the friends list for a user.
const getUserFriends = BatchedPromise<User[]>(
  {
    maxBatchSize: 1,
    cacheDuration: 5 * 60 * 1000,
    backgroundServiceKey: 'friendsService.getUserFriends',
  },
  async (userIds) => {
    const response = await fetch(
      `https://friends.roblox.com/v1/users/${userIds[0]}/friends`
    );

    if (!response.ok) {
      throw new Error(`Failed to load friends for user (${userIds[0]})`);
    }

    const result = await response.json();
    return [
      result.data.map((f: any) => ({
        id: f.id,
        name: f.name,
        displayName: f.displayName,
      })),
    ];
  }
);

export { getUserFriends };
