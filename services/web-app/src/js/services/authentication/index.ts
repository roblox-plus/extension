import { wait } from '@tix-factory/extension-utils';
import { User } from 'roblox';
import { apiBaseUrl } from '../../constants';

let logoutAvailable = true;
let authenticatedUserPromise: Promise<User | null>;
const loginsByCode: { [code: string]: Promise<User> } = {};

// Gets the currently authenticated user.
const getAuthenticatedUser = (): Promise<User | null> => {
  return (
    authenticatedUserPromise ||
    (authenticatedUserPromise = new Promise(async (resolve, reject) => {
      try {
        if (document.body.dataset.extensionId) {
          // Because Roblox OAuth2 doesn't support some users yet, we can't exclusively rely on it.
          // And because we know we have the extension installed, we can check who is logged in by
          // waiting for the extension to populate it into the page.
          for (let i = 0; i < 10; i++) {
            const userId = Number(document.body.dataset.userId);
            if (!isNaN(userId)) {
              if (userId > 0) {
                // If the extension was "logged in" because of the extension able to fetch the Roblox authentication
                // context, then no logout option is available, because that would just be "log out of Roblox".
                logoutAvailable = false;

                resolve({
                  id: userId,
                  name: `${document.body.dataset.userName}`,
                  displayName: `${document.body.dataset.userDisplayName}`,
                });

                return;
              }

              break;
            }

            await wait(500);
          }
        }

        const response = await fetch(
          `${apiBaseUrl.href}v1/users/authenticated`,
          {
            credentials: 'include',
          }
        );

        switch (response.status) {
          case 200:
            const result = await response.json();
            resolve(result.data);
            return;
          case 401:
            resolve(null);
            return;
          default:
            throw new Error(
              'Failed to determined authenticated user, please refresh the page to try again.'
            );
        }
      } catch (e) {
        if (window.location.hostname === 'localhost') {
          resolve({
            id: 48103520,
            name: 'WebGL3D',
            displayName: 'WebGL3D',
          });
          return;
        }

        reject(e);
      }
    }))
  );
};

// Logs in the user with their authorization code.
const login = (code: string): Promise<User> => {
  const loginPromise = loginsByCode[code];
  if (loginPromise) {
    return loginPromise;
  }

  return (loginsByCode[code] = new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${apiBaseUrl.href}v1/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: code,
        }),
      });

      if (response.status === 200) {
        resolve(await response.json());
        return;
      }

      throw new Error('Login failed, please try again.');
    } catch (e) {
      reject(e);
    }
  }));
};

// Logs the user out.
const logout = async () => {
  await fetch(`${apiBaseUrl.href}v1/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  window.location.reload();
};

// Checks if the user is allowed to logout.
const logoutEnabled = async () => {
  return logoutAvailable;
};

export { getAuthenticatedUser, login, logout, logoutEnabled };
