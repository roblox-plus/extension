import User from '../types/user';

// Fetches the user who is currently authenticated on the loaded web page.
const parseAuthenticatedUser = (): User | null => {
  const userData =
    globalThis.document && document.querySelector(`meta[name='user-data']`);

  // The user who is currently authenticated on the loaded web page.
  return userData
    ? {
        id: Number(userData.getAttribute('data-userid')),
        name: userData.getAttribute('data-name') || '',
        displayName: userData.getAttribute('data-displayname') || '',
      }
    : null;
};

const authenticatedUser = parseAuthenticatedUser();

export default authenticatedUser;

// TODO: Deprecate after manifest V3 conversion.
export { parseAuthenticatedUser };
