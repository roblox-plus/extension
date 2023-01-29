import User from '../types/user';

const userData = document.querySelector(`meta[name='user-data']`);
const authenticatedUser: User | null = userData
  ? {
      id: Number(userData.getAttribute('data-userid')),
      name: userData.getAttribute('data-name') || '',
      displayName: userData.getAttribute('data-displayname') || '',
    }
  : null;

export default authenticatedUser;
