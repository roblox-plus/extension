import { getToggleSettingValue } from '../../../services/settings';
import { getAuthenticatedUser } from '../../../services/users';

const tokenRefreshInterval = 30 * 60 * 1000;

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

const processMessage = async (message: any): Promise<void> => {
  try {
    const enabled = await isEnabled();
    if (!enabled) {
      return;
    }

    console.log('Processing gcm message', message);
  } catch (err) {
    console.error('Failed to process gcm message', err, message);
  }
};

// @ts-ignore:next-line: https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65809
chrome.instanceID.onTokenRefresh.addListener(updateToken);
chrome.gcm.onMessage.addListener(processMessage);

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
