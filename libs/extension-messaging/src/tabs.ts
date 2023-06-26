import { version } from './constants';

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

export { sendMessageToTab };
