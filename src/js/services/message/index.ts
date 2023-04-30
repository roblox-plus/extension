import { isBackgroundPage } from '../../constants';

// The type for representing a listener that can be attached by any service.
type MessageListener = (message: any) => Promise<any>;

// The internal result of processing a message.
type MessageResult = {
  success: boolean;
  data: string;
};

// Message listener options about how to handle messages.
type MessageListenerOptions = {
  // How many messages can be processed in parallel.
  // When set to -1, all messages can processed in parallel.
  levelOfParallelism: -1 | 1;
};

// All the listeners, set in the background page.
const listeners: {
  [destination: string]: (message: object) => Promise<MessageResult>;
} = {};

// All the tabs actively connected to the message service.
const tabs: { [key: string]: chrome.runtime.Port } = {};

// An identifier that tells us which version of the messaging service we're using,
// to ensure we don't try to process a message not intended for us.
const version = 2.5;

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
    } else {
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
    }
  });
};

// Fetches a tab that we can send a message to, for work processing.
const getWorkerTab = (): chrome.runtime.Port | undefined => {
  const keys = Object.keys(tabs);
  return keys.length > 0 ? tabs[keys[0]] : undefined;
};

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

  chrome.runtime.onConnect.addListener((port) => {
    const id = crypto.randomUUID();
    console.debug('Tab connected', id, port);
    tabs[id] = port;

    port.onDisconnect.addListener(() => {
      console.debug('Disconnecting tab', id, port);
      delete tabs[id];
    });
  });
} else {
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
}

// Ensures that the same tab won't connect multiple times.
declare global {
  var messageServiceConnection: chrome.runtime.Port;
}

export type { MessageListener };
export { sendMessage, addListener, getWorkerTab, sendMessageToTab };
