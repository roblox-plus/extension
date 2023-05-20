import { getUserByName } from '../../../../services/users';
import User from '../../../../types/user';

const userSearchPrefix = 'user:';

export default async (searchValue: string): Promise<User | null> => {
  if (!searchValue.trim()) {
    return null;
  }

  if (searchValue.startsWith(userSearchPrefix)) {
    return await getUserByName(searchValue.substring(userSearchPrefix.length));
  }

  return null;
};
