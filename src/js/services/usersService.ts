import User from '../types/user';
import { BatchedPromise, translateOutput } from '../utils/batchedPromise';

const _getAuthenticatedUser = BatchedPromise<User | null>(
  {
    cacheDuration: 15 * 1000,
  },
  async (_) => {
    const response = await fetch(
      'https://users.roblox.com/v1/users/authenticated'
    );

    if (response.status === 401) {
      return [null];
    }

    const result = await response.json();
    return [
      {
        id: result.id,
        name: result.name,
        displayName: result.displayName,
      },
    ];
  }
);

// Using BatchedPromise as a means to cache resolves/rejections, even though there is no actual input.
const getAuthenticatedUser = () => _getAuthenticatedUser(0);

const getUserById = BatchedPromise<User | null>({}, async (userIds) => {
  const response = await fetch('https://users.roblox.com/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userIds,
      excludeBannedUsers: false,
    }),
  });

  const result = await response.json();

  return translateOutput(
    userIds,
    result.data,
    (user: User) => user.id,
    (user: User) =>
      user
        ? {
            id: user.id,
            name: user.name,
            displayName: user.displayName,
          }
        : null
  );
});

// Export + attach to global
declare global {
  var usersService: any;
}

globalThis.usersService = { getAuthenticatedUser, getUserById };

export { getAuthenticatedUser, getUserById };
