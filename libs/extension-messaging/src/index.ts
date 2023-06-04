import { isBackgroundPage } from '@tix-factory/extension-utils';
import { version } from './constants';
import MessageListener from './types/message-listener';
import MessageListenerOptions from './types/message-listener-options';
import MessageResult from './types/message-result';

// All the listeners, set in the background page.
const listeners: {
  [destination: string]: (message: object) => Promise<MessageResult>;
} = {};

const externalResponseHandlers: {
  [messageId: string]: {
    resolve: (result: any) => void;
    reject: (error: any) => void;
  };
} = {};

// Send a message to a destination, and get back the result.
const sendMessage = async (
  destination: string,
  message: object
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const serializedMessage = JSON.stringify(message);

    if (isBackgroundPage) {
      // Message is from the background page, to the background page.
      try {
        if (listeners[destination]) {
          const message = JSON.parse(serializedMessage);
          const result = await listeners[destination](message);

          console.debug(
            `Local listener response for '${destination}':`,
            result,
            message
          );

          const data =
            result.data === undefined ? undefined : JSON.parse(result.data);

          if (result.success) {
            resolve(data);
          } else {
            reject(data);
          }
        } else {
          reject(`No message listener: ${destination}`);
        }
      } catch (e) {
        reject(e);
      }
    } else if (chrome?.runtime) {
      // Message is being sent from the content script
      const outboundMessage = JSON.stringify({
        version,
        destination,
        message: serializedMessage,
      });

      console.debug(`Sending message to '${destination}'`, serializedMessage);

      chrome.runtime.sendMessage(outboundMessage, (result: MessageResult) => {
        if (result === undefined) {
          reject(
            `Unexpected message result (undefined), suggests no listener in background page.\n\tDestination: ${destination}`
          );
          return;
        }

        const data =
          result.data === undefined ? undefined : JSON.parse(result.data);

        if (result.success) {
          resolve(data);
        } else {
          reject(data);
        }
      });
    } else if (document.body?.dataset.extensionId) {
      // Message is being sent by the native browser tab.
      const messageId = crypto.randomUUID();
      const timeout = setTimeout(() => {
        if (externalResponseHandlers[messageId]) {
          delete externalResponseHandlers[messageId];
          reject(`Message timed out trying to contact extension`);
        }
      }, 15 * 1000);

      externalResponseHandlers[messageId] = {
        resolve: (result) => {
          clearTimeout(timeout);
          delete externalResponseHandlers[messageId];

          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          delete externalResponseHandlers[messageId];

          reject(error);
        },
      };

      window.postMessage({
        version,
        extensionId: document.body.dataset.extensionId,
        destination,
        message,
        messageId,
      });
    } else {
      reject(`Could not find a way to transport the message to the extension.`);
    }
  });
};

// Listen for messages at a specific destination.
const addListener = (
  destination: string,
  listener: MessageListener,
  options: MessageListenerOptions = {
    levelOfParallelism: -1,
  }
): void => {
  if (listeners[destination]) {
    throw new Error(`${destination} already has message listener attached`);
  }

  const processMessage = async (message: object): Promise<MessageResult> => {
    try {
      console.debug(`Processing message for '${destination}'`, message);

      const result = await listener(message);
      const response = {
        success: true,
        data: JSON.stringify(result),
      };

      console.debug(
        `Successful message result from '${destination}':`,
        response,
        message
      );

      return response;
    } catch (err) {
      const response = {
        success: false,
        data: JSON.stringify(err),
      };

      console.debug(
        `Failed message result from '${destination}':`,
        response,
        message,
        err
      );

      return response;
    }
  };

  listeners[destination] = (message: object): Promise<MessageResult> => {
    if (options.levelOfParallelism !== 1) {
      return processMessage(message);
    }

    return new Promise((resolve, reject) => {
      // https://stackoverflow.com/a/73482349/1663648
      navigator.locks
        .request(`messageService:${destination}`, async () => {
          try {
            const result = await processMessage(message);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        })
        .catch(reject);
    });
  };
};

// If we're currently in the background page, listen for messages.
if (isBackgroundPage) {
  chrome.runtime.onMessage.addListener((rawMessage, sender, sendResponse) => {
    if (typeof rawMessage !== 'string') {
      // Not for us.
      return;
    }

    const fullMessage = JSON.parse(rawMessage);
    if (
      fullMessage.version !== version ||
      !fullMessage.destination ||
      !fullMessage.message
    ) {
      // Not for us.
      return;
    }

    const listener = listeners[fullMessage.destination];
    if (!listener) {
      sendResponse({
        success: false,
        data: JSON.stringify(
          `Could not route message to destination: ${fullMessage.destination}`
        ),
      });

      return;
    }

    const message = JSON.parse(fullMessage.message);
    listener(message)
      .then(sendResponse)
      .catch((err) => {
        console.error(
          'Listener is never expected to throw.',
          err,
          rawMessage,
          fullMessage
        );

        sendResponse({
          success: false,
          data: JSON.stringify(
            'Listener threw unhandled exception (see background page for error).'
          ),
        } as MessageResult);
      });

    // Required for asynchronous callbacks
    // https://stackoverflow.com/a/20077854/1663648
    return true;
  });
} else if (chrome?.runtime) {
  console.debug(
    `Not attaching listener for messages, because we're not in the background.`
  );

  if (!window.messageServiceConnection) {
    const port = (window.messageServiceConnection = chrome.runtime.connect(
      chrome.runtime.id,
      {
        name: 'messageService',
      }
    ));

    port.onMessage.addListener((rawMessage) => {
      if (typeof rawMessage !== 'string') {
        // Not for us.
        return;
      }

      const fullMessage = JSON.parse(rawMessage);
      if (
        fullMessage.version !== version ||
        !fullMessage.destination ||
        !fullMessage.message
      ) {
        // Not for us.
        return;
      }

      const listener = listeners[fullMessage.destination];
      if (!listener) {
        // No listener in this tab for this message.
        return;
      }

      // We don't really have a way to communicate the response back to the service worker.
      // So we just... do nothing with it.
      const message = JSON.parse(fullMessage.message);
      listener(message).catch((err) => {
        console.error(
          'Unhandled error processing message in tab',
          fullMessage,
          err
        );
      });
    });
  }

  // chrome.runtime is available, and we got a message from the window
  // this could be a tab trying to get information from the extension
  window.addEventListener('message', (messageEvent) => {
    const { extensionId, messageId, destination, message } = messageEvent.data;
    if (
      extensionId !== chrome.runtime.id ||
      !messageId ||
      !destination ||
      !message
    ) {
      // They didn't want to contact us.
      // Or if they did, they didn't have the required fields.
      return;
    }

    if (messageEvent.data.version !== version) {
      // They did want to contact us, but there was a version mismatch.
      // We can't handle this message.
      window.postMessage({
        extensionId: messageEvent.data.extensionId,
        messageId: messageEvent.data.messageId,
        success: false,
        data: `Extension message receiver is incompatible with message sender`,
      });

      return;
    }

    console.log('Received message for', destination, message);
  });
} else {
  // Not a background page, and not a content script.
  // This could be a page where we want to listen for calls from the tab.
  window.addEventListener('message', (messageEvent) => {
    // TODO: Process the message responses
  });
}

// Ensures that the same tab won't connect multiple times.
declare global {
  var messageServiceConnection: chrome.runtime.Port;
}

export { getWorkerTab, sendMessageToTab } from './tabs';
export type { MessageListener };
export { sendMessage, addListener };
