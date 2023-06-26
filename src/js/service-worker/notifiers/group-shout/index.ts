import { ThumbnailState, getGroupLink } from 'roblox';
import { getGroupShout, getUserGroups } from '../../../services/groups';
import {
  getSettingValue,
  getToggleSettingValue,
} from '../../../services/settings';
import { getGroupIcon } from '../../../services/thumbnails';
import { getAuthenticatedUser } from '../../../services/users';
import fetchDataUri from '../../../utils/fetchDataUri';

// The prefix for the ID of the notification to display.
const notificationIdPrefix = 'group-shout-notifier-';

type SlimGroup = {
  id: number;
  name: string;
};

// Returns all the groups that we want to load the group shouts for.
const getGroups = async (): Promise<SlimGroup[]> => {
  const groupMap: SlimGroup[] = [];

  const enabled = await getToggleSettingValue('groupShoutNotifier');
  if (!enabled) {
    // Not enabled, skip.
    return groupMap;
  }

  const authenticatedUser = await getAuthenticatedUser();
  if (!authenticatedUser) {
    // Not logged in, no notifier.
    return groupMap;
  }

  const mode = await getSettingValue('groupShoutNotifier_mode');
  if (mode === 'whitelist') {
    // Only specific groups should be notified on.
    const list = await getSettingValue('groupShoutNotifierList');
    if (typeof list !== 'object') {
      return groupMap;
    }

    for (let rawId in list) {
      const id = Number(rawId);
      if (id && typeof list[rawId] === 'string') {
        groupMap.push({
          id,
          name: list[rawId],
        });
      }
    }
  } else {
    // All groups the user is in should be notified on.
    const groups = await getUserGroups(authenticatedUser.id);
    groups.forEach((group) => {
      groupMap.push({
        id: group.id,
        name: group.name,
      });
    });
  }

  return groupMap;
};

chrome.notifications.onClicked.addListener((notificationId) => {
  if (!notificationId.startsWith(notificationIdPrefix)) {
    return;
  }

  chrome.tabs.create({
    url: getGroupLink(
      Number(notificationId.substring(notificationIdPrefix.length)),
      'redirect'
    ).href,
    active: true,
  });
});

type GroupShoutNotifierState = { [groupId: number]: string };

export default async (
  previousState: GroupShoutNotifierState | null
): Promise<GroupShoutNotifierState | null> => {
  const newState: GroupShoutNotifierState = {};
  const groups = await getGroups();

  const promises: Promise<void>[] = groups.map(async (group) => {
    try {
      const groupShout = await getGroupShout(group.id);
      newState[group.id] = groupShout;

      if (
        previousState &&
        previousState.hasOwnProperty(group.id) &&
        previousState[group.id] !== groupShout &&
        groupShout
      ) {
        // Send notification, the shout has changed.
        const groupIcon = await getGroupIcon(group.id);
        if (groupIcon.state !== ThumbnailState.Completed) {
          return;
        }

        const notificationIcon = await fetchDataUri(
          new URL(groupIcon.imageUrl)
        );

        chrome.notifications.create(`${notificationIdPrefix}${group.id}`, {
          type: 'basic',
          title: group.name,
          message: groupShout,
          contextMessage: 'Roblox+ Group Shout Notifier',
          iconUrl: notificationIcon,
        });
      }
    } catch (err) {
      console.error(
        'Failed to check group for group shout notifier',
        err,
        group
      );

      if (previousState && previousState.hasOwnProperty(group.id)) {
        newState[group.id] = previousState[group.id];
      }
    }
  });

  await Promise.all(promises);
  return newState;
};
