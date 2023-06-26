import { manifest } from '@tix-factory/extension-utils';
import { getSettingValue } from '../../../services/settings';
import { getAuthenticatedUser } from '../../../services/users';

const notificationId = 'startup-notification';

const displayStartupNotification = async (): Promise<void> => {
  if (!manifest.icons) {
    console.warn('Missing manifest icons');
    return;
  }

  const done = await chrome.storage.session.get(manifest.version);
  if (done[manifest.version]) {
    // Already showed this notification...
    return;
  }

  await chrome.storage.session.set({
    [manifest.version]: +new Date(),
  });

  const authenticatedUser = await getAuthenticatedUser();
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL(manifest.icons['128']),
    title: 'Roblox+ Started',
    message: authenticatedUser
      ? `Hello, ${authenticatedUser.displayName}`
      : 'You are currently signed out',
    contextMessage: `${manifest.name} ${manifest.version}, by WebGL3D`,
  });
};

getSettingValue('startupNotification')
  .then(async (setting) => {
    if (typeof setting !== 'object') {
      setting = {
        on: !chrome.extension.inIncognitoContext,
        visit: false,
      };
    }

    if (!setting.on) {
      return;
    }

    if (setting.visit) {
      // Only show the startup notification after Roblox has been visited.
      const updatedListener = (
        _tabId: number,
        _changes: chrome.tabs.TabChangeInfo,
        tab: chrome.tabs.Tab
      ): Promise<void> => {
        return takeAction(tab);
      };

      const takeAction = async (tab: chrome.tabs.Tab): Promise<void> => {
        if (!tab.url) {
          return;
        }

        try {
          const tabURL = new URL(tab.url);
          if (!tabURL.hostname.endsWith('.roblox.com')) {
            return;
          }

          chrome.tabs.onCreated.removeListener(takeAction);
          chrome.tabs.onUpdated.removeListener(updatedListener);
          await displayStartupNotification();
        } catch {
          // don't care for now
        }
      };

      chrome.tabs.onUpdated.addListener(updatedListener);
      chrome.tabs.onCreated.addListener(takeAction);
    } else {
      await displayStartupNotification();
    }
  })
  .catch((err) => {
    console.warn('Failed to render startup notification', err);
  });

chrome.notifications.onClicked.addListener((id) => {
  if (id !== notificationId) {
    return;
  }

  chrome.tabs.create({
    url: `https://roblox.plus/about/changes?version=${manifest.version}`,
    active: true,
  });
});
