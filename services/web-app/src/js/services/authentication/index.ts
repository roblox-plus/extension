import { apiBaseUrl } from '../../constants';
import User from '../../types/user';

let authenticatedUser: User | null | undefined;

// Gets the currently authenticated user.
const getAuthenticatedUser = async (): Promise<User | null> => {
  if (authenticatedUser !== undefined) {
    return authenticatedUser;
  }

  const response = await fetch(`${apiBaseUrl.href}v1/users/authenticated`, {
    credentials: 'include',
  });

  switch (response.status) {
    case 200:
      const payload = await response.json();
      return (authenticatedUser = payload.data);
    case 401:
      return (authenticatedUser = null);
    default:
      throw new Error(
        'Failed to determined authenticated user, please refresh the page to try again.'
      );
  }
};

// Logs in the user with their authorization code.
const login = async (code: string): Promise<User> => {
  const response = await fetch(`${apiBaseUrl.href}v1/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: code,
    }),
  });

  if (response.status === 200) {
    const result = await response.json();
    return result.data;
  }

  throw new Error('Login failed, please try again.');
};

// Logs the user out.
const logout = async () => {
  await fetch(`${apiBaseUrl.href}v1/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  window.location.reload();
};

export { getAuthenticatedUser, login, logout };
