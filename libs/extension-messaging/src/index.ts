import { isServiceWorker } from '@tix-factory/extension-utils';
import { version } from './constants';
import MessageListener from './types/message-listener';
import MessageListenerOptions from './types/message-listener-options';
import MessageResult from './types/message-result';

// All the listeners, set in the background page.
const listeners: {
  [destination: string]: (message: object) => Promise<MessageResult>;
} = {};

// Keep track of all the listeners that accept external calls.
const externalListeners: { [destination: string]: boolean } = {};

const externalResponseHandlers: {
  [messageId: string]: {
    resolve: (result: any) => void;
    reject: (error: any) => void;
  };
} = {};

// Send a message to a destination, and get back the result.
const sendMessage = async (
  destination: string,
  message: object,
  external?: boolean
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const serializedMessage = JSON.stringify(message);

    if (isServiceWorker) {
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
        external,
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

      globalThis.postMessage({
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

  if (options.allowExternalConnections) {
    externalListeners[destination] = true;
  }
};

// If we're currently in the background page, listen for messages.
if (isServiceWorker) {
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

    if (fullMessage.external && !externalListeners[fullMessage.destination]) {
      sendResponse({
        success: false,
        data: JSON.stringify('Listener does not accept external callers.'),
      });

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
} else if (globalThis.chrome?.runtime) {
  console.debug(
    `Not attaching listener for messages, because we're not in the background.`
  );

  if (!globalThis.messageServiceConnection) {
    const port = (globalThis.messageServiceConnection = chrome.runtime.connect(
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
  globalThis.addEventListener('message', async (messageEvent) => {
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
      globalThis.postMessage({
        extensionId,
        messageId,
        success: false,
        data: `Extension message receiver is incompatible with message sender`,
      });

      return;
    }

    console.debug('Received message for', destination, message);

    try {
      const response = await sendMessage(destination, message, true);

      // Success! Now go tell the client they got everything they wanted.
      globalThis.postMessage({
        extensionId,
        messageId,
        success: true,
        data: response,
      });
    } catch (e) {
      console.debug('Failed to send message to', destination, e);

      // :coffin:
      globalThis.postMessage({
        extensionId,
        messageId,
        success: false,
        data: e,
      });
    }
  });
} else {
  // Not a background page, and not a content script.
  // This could be a page where we want to listen for calls from the tab.
  globalThis.addEventListener('message', (messageEvent) => {
    const { extensionId, messageId, success, data } = messageEvent.data;
    if (
      extensionId !== document.body.dataset.extensionId ||
      !messageId ||
      typeof success !== 'boolean'
    ) {
      // Not for us.
      return;
    }

    // Check to see if we have a handler waiting for this message response...
    const responseHandler = externalResponseHandlers[messageId];
    if (!responseHandler) {
      console.warn(
        'We got a response back for a message we no longer have a handler for.',
        extensionId,
        messageId,
        success,
        data
      );
      return;
    }

    // Yay! Tell the krustomer we have their data, from the extension.
    console.debug('We received a response for', messageId, success, data);
    if (success) {
      responseHandler.resolve(data);
    } else {
      responseHandler.reject(data);
    }
  });
}

// Ensures that the same tab won't connect multiple times.
declare global {
  var messageServiceConnection: chrome.runtime.Port;
}

export { addListener, sendMessage };
export type { MessageListener };
