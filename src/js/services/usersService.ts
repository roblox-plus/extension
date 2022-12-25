import User from '../types/user';
import { BatchedPromise, translateOutput } from '../utils/batchedPromise';

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

globalThis.usersService = { getUserById };

export { getUserById };
