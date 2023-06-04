import { User } from 'roblox';
import { addListener, sendMessage } from '../message';

const messageDestination = 'usersService.getAuthenticatedUser';
const cacheDuration = 60 * 1000;
let authenticatedUser: User | null | undefined = undefined;

// Fetches the currently authenticated user.
const getAuthenticatedUser = (): Promise<User | null> => {
  return sendMessage(messageDestination, {});
};

// Loads the currently authenticated user.
const loadAuthenticatedUser = async (): Promise<User | null> => {
  if (authenticatedUser !== undefined) {
    return authenticatedUser;
  }

  try {
    const response = await fetch(
      'https://users.roblox.com/v1/users/authenticated'
    );

    if (response.status === 401) {
      return (authenticatedUser = null);
    } else if (!response.ok) {
      throw new Error('Failed to load authenticated user');
    }

    const result = await response.json();
    return (authenticatedUser = {
      id: result.id,
      name: result.name,
      displayName: result.displayName,
    });
  } finally {
    setTimeout(() => {
      authenticatedUser = undefined;
    }, cacheDuration);
  }
};

addListener(messageDestination, () => loadAuthenticatedUser(), {
  levelOfParallelism: 1,
});

export default getAuthenticatedUser;
