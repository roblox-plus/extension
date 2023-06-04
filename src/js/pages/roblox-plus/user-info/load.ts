import { ThumbnailState } from 'roblox';
import {
  getCreatorGroups,
  getUserGroups,
  getUserPrimaryGroup,
} from '../../../services/groups';
import { getPremiumExpirationDate } from '../../../services/premium';
import {
  getAvatarHeadshotThumbnail,
  getGroupIcon,
} from '../../../services/thumbnails';
import { getAuthenticatedUser } from '../../../services/users';
import Group from '../../../types/group';
import DetailedGroup from './detailed-group';
import UserInfo from './user-info';

// Loads a detailed group object.
const loadDetailedGroup = async (group: Group): Promise<DetailedGroup> => {
  const detailedGroup: DetailedGroup = Object.assign(
    {
      thumbnail: {
        imageUrl: '',
        state: ThumbnailState.Error,
      },
    },
    group
  );

  try {
    detailedGroup.thumbnail = await getGroupIcon(group.id);
  } catch (e) {
    console.warn('Failed to load thumbnail for group', group, e);
  }

  return detailedGroup;
};

// Loads all the information about the user that should be injected into the page.
const load = async (): Promise<UserInfo | null> => {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  const userInfo: UserInfo = {
    user,
    premiumExpiration: undefined,
    thumbnail: {
      imageUrl: '',
      state: ThumbnailState.Error,
    },
    groups: {
      list: [],
      creatorList: [],
      primary: null,
    },
  };

  try {
    userInfo.thumbnail = await getAvatarHeadshotThumbnail(user.id);
  } catch (err) {
    console.warn('Failed to load user thumbnail', user, err);
  }

  try {
    userInfo.premiumExpiration = await getPremiumExpirationDate(user.id);
  } catch (err) {
    console.warn('Failed to load user premium status', user, err);
  }

  try {
    const groupList = await getUserGroups(user.id);
    userInfo.groups.list = await Promise.all(groupList.map(loadDetailedGroup));

    const primaryGroup = await getUserPrimaryGroup(user.id);
    if (primaryGroup) {
      userInfo.groups.primary = await loadDetailedGroup(primaryGroup);
    }

    const creatorGroups = await getCreatorGroups(user.id);
    userInfo.groups.creatorList = await Promise.all(
      creatorGroups.map(loadDetailedGroup)
    );
  } catch (err) {
    console.warn('Failed to load groups for user', user, err);
  }

  return userInfo;
};

export default load;
