import { isBackgroundServiceWorker, isBrowserAction } from '../constants';
import { addMessageListener, sendMessage } from '../services/extensionService';

// Keep track of the tabs, so we can put the user back where they were.b
let previousTab: chrome.tabs.Tab | undefined = undefined;
let protocolLauncherTab: chrome.tabs.Tab | undefined = undefined;

// Launch the protocol URL from a service worker.
const launchProtocolUrl = async (protocolUrl: string) => {
  const currentTab = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  previousTab = currentTab[0];

  if (previousTab) {
    // Try to open the protocol launcher tab right next to the current tab, so that when it
    // closes, it will put the user back on the tab they are on now.
    protocolLauncherTab = await chrome.tabs.create({
      url: protocolUrl,
      index: previousTab.index + 1,
      windowId: previousTab.windowId,
    });
  } else {
    await chrome.tabs.create({ url: protocolUrl });

    // If we don't know where they were before, then don't try to keep track of anything.
    previousTab = undefined;
    protocolLauncherTab = undefined;
  }
};

if (isBackgroundServiceWorker) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === protocolLauncherTab?.id && previousTab?.id) {
      chrome.tabs.update(previousTab.id, {
        active: true,
      });
    }

    previousTab = undefined;
    protocolLauncherTab = undefined;
  });

  addMessageListener('launchProtocolUrl', (protocolUrl) =>
    launchProtocolUrl(protocolUrl)
  );
}

// Launches a protocol URL, using the most user-friendly method.
export default async (protocolUrl: string) => {
  if (isBackgroundServiceWorker) {
    await launchProtocolUrl(protocolUrl);
  } else if (isBrowserAction) {
    // browser actions could attempt to popup an unwelcoming "are you sure you want chrome-extension:// to launch protocol url" popup.
    // use the same method as if it was a service worker
    await sendMessage('launchProtocolUrl', protocolUrl);
  } else if (location) {
    // If we're in a tab, we can launch the URL directly.
    location.href = protocolUrl;
  } else {
    // When all else fails.. to the service worker!
    await sendMessage('launchProtocolUrl', protocolUrl);
  }
};
