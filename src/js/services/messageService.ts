import { isBackgroundPage } from '../constants';

// The type for representing a listener that can be attached by any service.
type MessageListener = (message: any) => Promise<any>;

// The internal result of processing a message.
type MessageResult = {
  success: boolean;
  data: string;
};

// All the listeners, set in the background page.
const listeners: {
  [destination: string]: (message: object) => Promise<MessageResult>;
} = {};

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

// Listen for messages at a specific destination.
const addListener = (destination: string, listener: MessageListener): void => {
  if (listeners[destination]) {
    throw new Error(`${destination} already has message listener attached`);
  }

  listeners[destination] = async (message: object): Promise<MessageResult> => {
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
} else {
  console.debug(
    `Not attaching listener for messages, because we're not in the background.`
  );
}

export type { MessageListener };
export { sendMessage, addListener };
