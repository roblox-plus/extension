import { getAuthenticatedUser } from '../../../services/users';

declare namespace chrome.instanceID {
  export interface TokenRefreshEvent
    extends chrome.events.Event<(token: string) => void> {}
}

const updateToken = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const authenticatedUser = await getAuthenticatedUser();

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

const processMessage = (message: any) => {
  console.log('process message', message);
};

chrome.gcm.onMessage.addListener(processMessage);
chrome.instanceID.onTokenRefresh.addListener(updateToken);
