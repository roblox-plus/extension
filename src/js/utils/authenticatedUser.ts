import User from '../types/user';

const userData =
  globalThis.document && document.querySelector(`meta[name='user-data']`);

// The user who is currently authenticated on the loaded web page.
const authenticatedUser: User | null = userData
  ? {
      id: Number(userData.getAttribute('data-userid')),
      name: userData.getAttribute('data-name') || '',
      displayName: userData.getAttribute('data-displayname') || '',
    }
  : null;

export default authenticatedUser;
