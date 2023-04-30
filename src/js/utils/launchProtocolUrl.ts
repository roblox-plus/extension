import { isBackgroundPage } from '../constants';
import { addListener, sendMessage } from '../services/message';

const messageDestination = 'launchProtocolUrl';

// The type for the message being passed to the background.
type BackgroundMessage = {
  protocolUrl: string;
};

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

if (isBackgroundPage) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    // Return the user to the tab they were on before, when we're done launching the protocol URL.
    // chrome self-closes the protocol URL tab when opened.
    if (tabId === protocolLauncherTab?.id && previousTab?.id) {
      chrome.tabs.update(previousTab.id, {
        active: true,
      });
    }

    previousTab = undefined;
    protocolLauncherTab = undefined;
  });

  addListener(messageDestination, (message: BackgroundMessage) =>
    launchProtocolUrl(message.protocolUrl)
  );
}

// Launches a protocol URL, using the most user-friendly method.
export default async (protocolUrl: string) => {
  if (location) {
    // If we're in a tab, we can launch the URL directly.
    location.href = protocolUrl;
  } else {
    // Otherwise, try to send it to the background to be launched in a tab.
    await sendMessage(messageDestination, { protocolUrl });
  }
};
