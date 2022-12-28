import { isBackgroundServiceWorker } from '../constants';

type MessageData = string | number | { [i: string]: any };

const backgroundServices: {
  [backgroundServiceKey: string]: (data: MessageData) => Promise<any>;
} = {};

const addMessageListener = (
  serviceName: string,
  handler: (data: any) => Promise<any>
) => {
  backgroundServices[serviceName] = handler;
};

const sendMessage = (serviceName: string, data: MessageData): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await chrome.runtime.sendMessage({
        serviceName,
        data,
      });

      if (!response) {
        reject(new Error('No response from service worker.'));
        return;
      }

      if (response.hasOwnProperty('error')) {
        reject(response.error);
      } else {
        resolve(response.data);
      }
    } catch (e) {
      try {
        reject(e);
      } catch (e2) {
        console.error(
          'Failed to reject a promise that was sent to the service worker, which also potentially never made it to the service worker.',
          e2
        );
      }
    }
  });
};

const reload = () => {
  console.log('hoopla');

  if (isBackgroundServiceWorker) {
    setTimeout(() => {
      chrome.runtime.reload();
    }, 250);

    return Promise.resolve();
  } else {
    return sendMessage('extensionService.reload', {}).then(() => {
      setTimeout(() => location.reload(), 500);
    });
  }
};

if (isBackgroundServiceWorker) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id || !message.serviceName) {
      // Not for us.
      return;
    }

    const backgroundService = backgroundServices[message.serviceName];
    if (!backgroundService) {
      sendResponse({
        error: `Missing required background service: ${message.serviceName}`,
      });

      return;
    }

    backgroundService(message.data)
      .then((data) => {
        sendResponse({ data });
      })
      .catch((error) => {
        sendResponse({ error });
      });

    // Required for asynchronous callbacks
    // https://stackoverflow.com/a/20077854/1663648
    return true;
  });

  addMessageListener('extensionService.reload', (data: MessageData) =>
    reload()
  );
}

export { reload, sendMessage, addMessageListener };
