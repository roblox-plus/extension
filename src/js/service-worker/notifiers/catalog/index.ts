import { isAuthenticatedUserFollowing } from '../../../services/followings';
import { getToggleSettingValue } from '../../../services/settings';
import { getAuthenticatedUser, getUserByName } from '../../../services/users';
import fetchDataUri from '../../../utils/fetchDataUri';

const tokenRefreshInterval = 30 * 60 * 1000;
const notificationIdPrefix = 'catalog_notifier:';

const isEnabled = (): Promise<boolean> => {
  return getToggleSettingValue('itemNotifier');
};

const updateToken = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const enabled = await isEnabled();
      if (!enabled) {
        // Do nothing if the notifier is not enabled.
        resolve();
        return;
      }

      const authenticatedUser = await getAuthenticatedUser();

      // @ts-ignore:next-line: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65809
      chrome.instanceID.getToken(
        { authorizedEntity: '303497097698', scope: 'FCM' },
        (token: string) => {
          fetch('https://api.roblox.plus/v2/itemnotifier/registertoken', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `robloxUserId=${
              authenticatedUser?.id
            }&token=${encodeURIComponent(token)}`,
          })
            .then((response) => {
              if (response.ok) {
                resolve();
              } else {
                reject();
              }
            })
            .catch(reject);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

const shouldShowNotification = async (
  creatorName?: string
): Promise<boolean> => {
  // This logic is no longer valid, but still in use. It doesn't support group creators, it assumes all creators are users that can be followed.
  // As a result: No notifications for group-created items will be shown.
  if (!creatorName) {
    // If there's no creator on the notification, it is assumed to be created by the Roblox account.
    // And of course everyone wants these notifications.. right?
    return true;
  }

  const authenticatedUser = await getAuthenticatedUser();
  if (!authenticatedUser) {
    // Not logged in, no notification.
    return false;
  }

  if (authenticatedUser.name === creatorName) {
    // Of course you always want to see your own notifications.
    return true;
  }

  const creator = await getUserByName(creatorName);
  if (!creator) {
    // Couldn't determine who the user is, so no notification will be visible. Cool.
    return false;
  }

  // And the final kicker... you can only see notifications if you follow the creator.
  const isFollowing = await isAuthenticatedUserFollowing(creator.id);
  return isFollowing;
};

const processNotification = async (notification: any): Promise<any> => {
  const showNotification = await shouldShowNotification(
    notification.items?.Creator
  );
  if (!showNotification) {
    console.log(
      'Skipping notification, likely because the authenticated user does not follow the creator',
      notification
    );
    return;
  }

  const requireProperties = ['icon', 'url', 'title', 'message'];
  for (let i = 0; i < requireProperties.length; i++) {
    if (!notification[requireProperties[i]]) {
      console.warn(
        `Skipping notification because there is no ${requireProperties[i]}`,
        notification
      );
      return;
    }
  }

  const iconUrl = await fetchDataUri(notification.icon);
  const notificationOptions: chrome.notifications.NotificationOptions<true> = {
    type: 'basic',
    iconUrl,
    title: notification.title,
    message: notification.message,
  };

  if (notification.items && Object.keys(notification.items).length > 0) {
    notificationOptions.type = 'list';
    notificationOptions.items = [];
    for (let title in notification.items) {
      notificationOptions.items.push({
        title,
        message: notification.items[title],
      });
    }
  }

  chrome.notifications.create(
    `${notificationIdPrefix}${notification.url}`,
    notificationOptions,
    () => {}
  );
};

const processMessage = async (message: any): Promise<void> => {
  try {
    const enabled = await isEnabled();
    if (!enabled) {
      return;
    }

    console.log('Processing gcm message', message);

    switch (message.from) {
      case '/topics/catalog-notifier':
      case '/topics/catalog-notifier-premium':
        if (!message.data?.notification) {
          console.warn('Failed to parse gcm message notification', message);
          return;
        }

        await processNotification(JSON.parse(message.data.notification));

        return;
      default:
        console.warn('Unknown gcm message sender', message);
        return;
    }
  } catch (err) {
    console.error('Failed to process gcm message', err, message);
  }
};

// @ts-ignore:next-line: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65809
chrome.instanceID.onTokenRefresh.addListener(updateToken);
chrome.gcm.onMessage.addListener(processMessage);

chrome.notifications.onClicked.addListener((notificationId) => {
  if (!notificationId.startsWith(notificationIdPrefix)) {
    return;
  }

  const url = notificationId.substring(notificationIdPrefix.length);
  if (!url.startsWith('https://www.roblox.com/')) {
    console.warn(
      'Skipped opening URL for notification because it was not for roblox.com',
      notificationId
    );
    return;
  }

  chrome.tabs.create({
    url,
    active: true,
  });
});

export default async function (
  nextTokenUpdate: number | null
): Promise<number> {
  const enabled = await isEnabled();
  if (!enabled) {
    return 0;
  }

  // Check to see if it's time to refresh the token
  const now = +new Date();
  if (nextTokenUpdate && nextTokenUpdate > now) {
    return nextTokenUpdate;
  }

  // Send the token to the server
  await updateToken();

  // Update the token again later
  return now + tokenRefreshInterval;
}
