import User from '../../types/user';
import { addListener, sendMessage } from '../message';

const messageDestination = 'usersService.getAuthenticatedUser';
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

  const response = await fetch(
    'https://users.roblox.com/v1/users/authenticated'
  );

  if (response.status === 401) {
    return (authenticatedUser = null);
  } else if (!response.ok) {
    throw new Error('Failed to load authenticated user');
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    displayName: result.displayName,
  };
};

addListener(messageDestination, () => loadAuthenticatedUser(), {
  levelOfParallelism: 1,
});

export default getAuthenticatedUser;
