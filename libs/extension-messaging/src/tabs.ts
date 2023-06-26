import { isServiceWorker } from '@tix-factory/extension-utils';
import { version } from './constants';

// All the tabs actively connected to the message service.
const tabs: { [key: string]: chrome.runtime.Port } = {};

// Sends a message to a tab.
const sendMessageToTab = async (
  destination: string,
  message: object,
  tab: chrome.runtime.Port
): Promise<void> => {
  const serializedMessage = JSON.stringify(message);
  const outboundMessage = JSON.stringify({
    version,
    destination,
    message: serializedMessage,
  });

  console.debug(
    `Sending message to '${destination}' in tab`,
    serializedMessage,
    tab
  );

  tab.postMessage(outboundMessage);
};

// Fetches a tab that we can send a message to, for work processing.
const getWorkerTab = (): chrome.runtime.Port | undefined => {
  const keys = Object.keys(tabs);
  return keys.length > 0 ? tabs[keys[0]] : undefined;
};

if (isServiceWorker) {
  chrome.runtime.onConnect.addListener((port) => {
    const id = crypto.randomUUID();
    console.debug('Tab connected', id, port);
    tabs[id] = port;

    port.onDisconnect.addListener(() => {
      console.debug('Disconnecting tab', id, port);
      delete tabs[id];
    });
  });
}

export { getWorkerTab, sendMessageToTab };
