import User from '../types/user';
import { BatchedPromise, translateOutput } from '../utils/batchedPromise';

const _getAuthenticatedUser = BatchedPromise<User | null>(
  {
    cacheDuration: 15 * 1000,
  },
  async (_) => {
    if (document) {
      // TODO: Think about this logic.. on one hand it saves us requests, because the data is in the page load.
      // On the other hand, the user could log out in one tab, this tab may not reload, and then log in as someone else,
      // and then suddenly this returns the wrong data.
      const userData = document.querySelector(`meta[name='user-data']`);
      if (userData) {
        return [
          {
            id: Number(userData.getAttribute('data-userid')),
            name: userData.getAttribute('data-name'),
            displayName: userData.getAttribute('data-displayname'),
          },
        ];
      }
    }

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

const getUserById = BatchedPromise<User | null>(
  {
    cacheDuration: 60 * 1000,
  },
  async (userIds) => {
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
  }
);

const _getUserByName = BatchedPromise<User | null>(
  {
    cacheDuration: 60 * 1000,
  },
  async (usernames) => {
    const response = await fetch(
      'https://users.roblox.com/v1/usernames/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernames,
          excludeBannedUsers: false,
        }),
      }
    );

    const result = await response.json();

    return translateOutput(
      usernames,
      result.data,
      (user: any) => user.requestedUsername,
      (user: User) =>
        user
          ? {
              id: user.id,
              name: user.name,
              displayName: user.displayName,
            }
          : null
    );
  }
);

// Translate it so that the
const getUserByName = (username: string) =>
  _getUserByName(username.toLowerCase());

// Export + attach to global
declare global {
  var usersService: any;
}

globalThis.usersService = { getAuthenticatedUser, getUserById, getUserByName };

export { getAuthenticatedUser, getUserById, getUserByName };
