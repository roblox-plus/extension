import ThumbnailState from '../../enums/thumbnailState';
import {
  getCreatorGroups,
  getUserGroups,
  getUserPrimaryGroup,
} from '../../services/groups';
import { getPremiumExpirationDate } from '../../services/premium';
import {
  getAvatarHeadshotThumbnail,
  getGroupIcon,
} from '../../services/thumbnails';
import { getAuthenticatedUser } from '../../services/users';

const load = async () => {
  if (!document.body) {
    // No body yet... try again.
    setTimeout(load, 1);
    return;
  }

  document.body.setAttribute('data-extension-id', chrome.runtime.id);

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      document.body.setAttribute('data-user-id', '0');
      return;
    }

    try {
      const primaryGroup = await getUserPrimaryGroup(user.id);
      const userGroups = await getUserGroups(user.id);
      const creatorGroups = await getCreatorGroups(user.id);
      const creatorGroupIds = creatorGroups.map((g) => g.id);

      const groupsContainer = document.createElement('div');
      groupsContainer.setAttribute('id', 'rplus-groups');
      groupsContainer.style.display = 'hidden';

      userGroups.forEach(async (group) => {
        const groupMeta = document.createElement('meta');
        groupMeta.setAttribute('data-group-id', `${group.id}`);
        groupMeta.setAttribute('data-group-name', group.name);
        groupMeta.setAttribute(
          'data-group-manager',
          `${creatorGroupIds.includes(group.id)}`
        );
        groupMeta.setAttribute(
          'data-group-primary',
          `${primaryGroup?.id === group.id}`
        );

        groupsContainer.append(groupMeta);

        try {
          const groupIcon = await getGroupIcon(group.id);
          if (groupIcon.state === ThumbnailState.Completed) {
            groupMeta.setAttribute('data-group-icon', groupIcon.imageUrl);
          }
        } catch (e) {
          console.warn('Failed to load group icon', group, e);
        }
      });

      document.body.append(groupsContainer);
    } catch (e) {
      console.warn('Failed to load creator groups', e);
    }

    try {
      const premiumExpiration = await getPremiumExpirationDate(user.id);
      if (premiumExpiration === null) {
        document.body.setAttribute('data-user-premium-expiration', 'null');
      } else if (premiumExpiration) {
        document.body.setAttribute(
          'data-user-premium-expiration',
          premiumExpiration.toISOString()
        );
      }
    } catch (e) {
      document.body.setAttribute('data-user-premium-expiration', 'error');
      console.error('Failed to check user premium subscription', e);
    }

    document.body.setAttribute('data-user-id', `${user.id}`);
    document.body.setAttribute('data-user-name', user.name);
    document.body.setAttribute('data-user-display-name', user.displayName);

    const thumbnail = await getAvatarHeadshotThumbnail(user.id);
    document.body.setAttribute('data-user-thumbnail-state', thumbnail.state);
    document.body.setAttribute('data-user-thumbnail-image', thumbnail.imageUrl);
  } catch (err) {
    console.error('Failed to load page data from extension', err);
  }
};

load();
