import { User, getIdFromUrl } from 'roblox';
import { getUserById, getUserByName } from '../../../../services/users';

const userSearchPrefix = 'user:';

export default async (searchValue: string): Promise<User | null> => {
  if (!searchValue.trim()) {
    return null;
  }

  if (searchValue.startsWith(userSearchPrefix)) {
    return await getUserByName(searchValue.substring(userSearchPrefix.length));
  }

  try {
    const url = new URL(searchValue);
    if (!url.pathname.startsWith('/users/')) {
      return null;
    }

    const id = getIdFromUrl(url);
    if (!id) {
      return null;
    }

    return await getUserById(id);
  } catch {
    // failed to parse URL, that's ok
    return null;
  }
};
