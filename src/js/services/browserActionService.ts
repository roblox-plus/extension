import { isBackgroundServiceWorker } from '../constants';
import User from '../types/user';
import { getIdFromUrl } from '../utils/linkify';
import { addMessageListener, sendMessage } from './extensionService';
import { getAuthenticatedUser, getUserById } from './usersService';

let userToView: User | null = null;
let lastKnownUser: User | null = null;
let browserActionPort: chrome.runtime.Port | undefined = undefined;

const _viewUser = (port: chrome.runtime.Port, user: User | null) => {
  if (browserActionPort !== port) {
    // context is no longer valid, skip
    return;
  }

  if (user) {
    lastKnownUser = user;
  }

  try {
    port.postMessage({
      user,
    });
  } catch (err) {
    console.warn('Failed to post message to browser-action port', err);
  }
};

const viewUser = async (user: User): Promise<void> => {
  if (isBackgroundServiceWorker) {
    if (browserActionPort) {
      _viewUser(browserActionPort, user);
    } else {
      userToView = user;

      // Apparently this method is documented, and typed, but doesn't actually exist yet. :coffin:
      // https://github.com/GoogleChrome/developer.chrome.com/issues/2602
      await chrome.action.openPopup();
    }
  } else {
    await sendMessage('browserActionService.viewUser', {
      user: user,
    }).catch((err) => {
      console.error('Failed to open browser action', err, user);
    });
  }
};

if (isBackgroundServiceWorker) {
  addMessageListener('browserActionService.viewUser', (message) =>
    viewUser(message.user)
  );

  chrome.runtime.onConnect.addListener(async (port) => {
    if (port.name !== 'browser-action') {
      return;
    }

    browserActionPort = port;

    if (userToView) {
      _viewUser(browserActionPort, userToView);

      // Let the default behavior fall back after we've shown the user the first time.
      userToView = null;
    } else {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
        lastFocusedWindow: true,
        url: [
          'https://www.roblox.com/users/*',
          'https://web.roblox.com/users/*',
        ],
      });

      const userId = tabs[0]?.url ? getIdFromUrl(new URL(tabs[0].url)) : NaN;
      if (!isNaN(userId)) {
        // If we're viewing a user page, try to get the URL
        getUserById(userId)
          .then((user) => {
            _viewUser(port, user);
          })
          .catch((err) => {
            console.error(
              'Failed to load current user for browser-action',
              userId,
              err
            );

            _viewUser(port, null);
          });
      } else if (lastKnownUser) {
        // Before defaulting to the authenticated user, attempt to view the last user we viewed.
        _viewUser(port, lastKnownUser);
      } else {
        getAuthenticatedUser()
          .then((user) => {
            _viewUser(port, user);
          })
          .catch((err) => {
            console.error(
              'Failed to load authenticated user for browser-action',
              err
            );

            _viewUser(port, null);
          });
      }
    }

    port.onDisconnect.addListener(() => {
      if (browserActionPort === port) {
        browserActionPort = undefined;
      }
    });
  });
}

export { viewUser };
