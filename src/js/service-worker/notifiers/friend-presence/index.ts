import PresenceType from '../../../enums/presenceType';
import { getUserFriends } from '../../../services/friendsService';
import { followUser } from '../../../services/gameLaunchService';
import { getTranslationResource } from '../../../services/localizationService';
import { getUserPresence } from '../../../services/presenceService';
import { getAvatarHeadshotThumbnail } from '../../../services/thumbnailsService';
import { isAuthenticatedUserFollowing } from '../../../services/userFollowingsService';
import { getAuthenticatedUser } from '../../../services/usersService';
import User from '../../../types/user';
import UserPresence from '../../../types/userPresence';
import fetchDataUri from '../../../utils/fetchDataUri';
import { getUserProfileLink } from '../../../utils/linkify';

// The prefix for the ID of the notification to display.
const notificationIdPrefix = 'friend-notifier-';

// Type type for the state that is stored for this notifier.
type FriendPresenceMap = {
  [userId: number]: UserPresence;
};

// A method to check if two presences match.
const presenceMatches = (a: UserPresence, b: UserPresence) => {
  if (a.type !== b.type) {
    // Not the same presence type, definitely not a match.
    return false;
  }

  if (a.location?.id !== b.location?.id) {
    // Not the same place, definitely not a match.
    return false;
  }

  // The type, and location are the same. Must be the same presence.
  return true;
};

// Gets the icon URL to display on the notification.
const getNotificationIconUrl = async (userId: number): Promise<string> => {
  const thumbnail = await getAvatarHeadshotThumbnail(userId);
  if (!thumbnail.imageUrl) {
    return '';
  }

  try {
    return await fetchDataUri(new URL(thumbnail.imageUrl));
  } catch (err) {
    console.error(
      'Failed to fetch icon URL from thumbnail',
      userId,
      thumbnail,
      err
    );
    return '';
  }
};

// Fetches the title for the notification to display to the user, based on current and previous known presence.
const getNotificationTitle = (
  user: User,
  presence: UserPresence,
  previousState: UserPresence
) => {
  switch (presence.type) {
    case PresenceType.Offline:
      return `${user.displayName} went offline`;
    case PresenceType.Online:
      if (previousState.type !== PresenceType.Offline) {
        // If they were already online, don't notify them of this again.
        return '';
      }

      return `${user.displayName} is now online`;
    case PresenceType.Experience:
      if (!presence.location?.name) {
        // They joined an experience, but we don't know what they're playing.
        // Don't tell the human what we don't know.
        return '';
      }

      return `${user.displayName} is now playing`;
    case PresenceType.Studio:
      if (!presence.location?.name) {
        // They launched Roblox studio, but we don't know what they're creating.
        // Don't tell the human what we don't know.
        return '';
      }

      if (previousState.type !== PresenceType.Online) {
        // If they went from in-experience -> in-studio, it's possible they just had Roblox studio open
        // while playing a game, and then closed it.
        // Occassionally I have also observed offline <-> Studio swapping back and forth..
        // This creates noise, and we don't like noise.
        return '';
      }

      return `${user.displayName} is now creating`;
  }
};

// Gets the buttons that should be displayed on a notification, based on the presence.
const getNotificationButtons = async (
  presence: UserPresence
): Promise<chrome.notifications.ButtonOptions[]> => {
  if (presence.type === PresenceType.Experience && presence.location?.id) {
    const joinText = await getTranslationResource(
      'Feature.PeopleList',
      'Action.Join'
    );

    return [
      {
        title: joinText,
      },
    ];
  }

  return [];
};

// Handle what happens when a notification is clicked.
chrome.notifications.onClicked.addListener((notificationId) => {
  if (!notificationId.startsWith(notificationIdPrefix)) {
    return;
  }

  chrome.tabs.create({
    url: getUserProfileLink(
      Number(notificationId.substring(notificationIdPrefix.length))
    ).href,
    active: true,
  });
});

chrome.notifications.onButtonClicked.addListener(async (notificationId) => {
  if (!notificationId.startsWith(notificationIdPrefix)) {
    return;
  }

  const userId = Number(notificationId.substring(notificationIdPrefix.length));

  try {
    await followUser(userId);
  } catch (err) {
    console.error('Failed to launch the experience', err);
  }
});

// Processes the presences, and send the notifications, when appropriate.
export default async (previousStates: FriendPresenceMap | undefined) => {
  // Check who is logged in right now.
  const authenticatedUser = await getAuthenticatedUser();
  if (!authenticatedUser) {
    // User is not logged in, no state to return.
    return null;
  }

  // Fetch the friends
  const friends = await getUserFriends(authenticatedUser.id);

  // Check the presence for each of the friends
  const currentState: FriendPresenceMap = {};
  await Promise.all(
    friends.map(async (friend) => {
      const presence = (currentState[friend.id] = await getUserPresence(
        friend.id
      ));

      const previousState = previousStates && previousStates[friend.id];

      if (previousState && !presenceMatches(previousState, presence)) {
        // The presence for this friend changed, do something!
        const notificationId = notificationIdPrefix + friend.id;
        const buttons = await getNotificationButtons(presence);

        const title = getNotificationTitle(friend, presence, previousState);
        if (!title) {
          // We don't have a title for the notification, so don't show one.
          chrome.notifications.clear(notificationId);
          return;
        }

        const isFollowing = await isAuthenticatedUserFollowing(friend.id);
        if (!isFollowing) {
          // We're not following this friend, don't show notifications about them.
          chrome.notifications.clear(notificationId);
          return;
        }

        const iconUrl = await getNotificationIconUrl(friend.id);
        if (!iconUrl) {
          // We don't have an icon we can use, so we can't display a notification.
          chrome.notifications.clear(notificationId);
          return;
        }

        chrome.notifications.create(notificationId, {
          type: 'basic',
          iconUrl,
          title,
          message: presence.location?.name ?? '',
          contextMessage: 'Roblox+ Friend Notifier',
          isClickable: true,
          buttons,
        });
      }
    })
  );

  return currentState;
};
