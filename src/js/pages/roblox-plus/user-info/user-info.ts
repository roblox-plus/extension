import Thumbnail from '../../../types/thumbnail';
import User from '../../../types/user';
import DetailedGroup from './detailed-group';

// User info to be loaded into the roblox.plus domain.
type UserInfo = {
  // The authenticated user.
  user: User;

  // The premium expiration for the authenticated user.
  premiumExpiration: Date | null | undefined;

  // The thumbnail for the user.
  thumbnail: Thumbnail;

  groups: {
    // The groups that the authenticated user is in.
    list: DetailedGroup[];

    // Groups the authenticated user has management permissions in.
    creatorList: DetailedGroup[];

    // The primary group for the authenticated user.
    primary: DetailedGroup | null;
  };
};

export default UserInfo;
