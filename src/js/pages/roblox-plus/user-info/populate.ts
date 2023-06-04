import ThumbnailState from '../../../enums/thumbnailState';
import DetailedGroup from './detailed-group';
import UserInfo from './user-info';

// Creates an individual element containing the group information.
const createGroupMeta = (
  group: DetailedGroup,
  creatorGroupIds: number[],
  primaryGroupId?: number
): HTMLMetaElement => {
  const groupMeta = document.createElement('meta');
  groupMeta.dataset.groupId = `${group.id}`;
  groupMeta.dataset.groupName = group.name;
  groupMeta.dataset.groupManager = `${creatorGroupIds.includes(group.id)}`;
  groupMeta.dataset.groupPrimary = `${primaryGroupId === group.id}`;

  if (group.thumbnail.state === ThumbnailState.Completed) {
    groupMeta.dataset.groupIcon = group.thumbnail.imageUrl;
  }

  return groupMeta;
};

// Creates the container which is popualted with all the groups.
const createGroupsContainer = (userInfo: UserInfo): HTMLDivElement => {
  const groupsContainer = document.createElement('div');
  groupsContainer.setAttribute('id', 'rplus-groups');
  groupsContainer.style.display = 'hidden';

  const creatorGroupIds = userInfo.groups.creatorList.map((g) => g.id);
  userInfo.groups.list.forEach((group) => {
    groupsContainer.append(
      createGroupMeta(group, creatorGroupIds, userInfo.groups.primary?.id)
    );
  });

  return groupsContainer;
};

// Populate all the information into the DOM.
const populate = (userInfo: UserInfo | null) => {
  const data: { [key: string]: string } = {};

  try {
    if (!userInfo) {
      data.userId = '0';
      data.userThumbnailState = ThumbnailState.Blocked;
      return;
    }

    // Populate group information
    document.body.append(createGroupsContainer(userInfo));

    // Inject in premium status
    if (userInfo.premiumExpiration === null) {
      data.userPremiumExpiration = 'null';
    } else if (userInfo.premiumExpiration) {
      data.userPremiumExpiration = userInfo.premiumExpiration.toISOString();
    }

    // Inject in user data
    data.userId = `${userInfo.user.id}`;
    data.userName = userInfo.user.name;
    data.userDisplayName = userInfo.user.displayName;

    // HACK: Inject in thumbnail last, the app waits for the thumbnail state to be loaded in before doing anything.
    data.userThumbnailImage = userInfo.thumbnail.imageUrl;
    data.userThumbnailState = userInfo.thumbnail.state;
  } catch (err) {
    console.error('Failed to load page data from extension', err);
  } finally {
    Object.keys(data).forEach((key) => {
      document.body.dataset[key] = data[key];
    });
  }
};

export default populate;
