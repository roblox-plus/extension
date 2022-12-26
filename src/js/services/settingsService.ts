import { BatchedPromise } from '../utils/batchedPromise';
import { isBackgroundServiceWorker } from '../constants';

const _getSettingValue = BatchedPromise<any>(
  {
    maxBatchSize: 1,
    minWaitTime: 0,
    maxWaitTime: 0,
    backgroundServiceKey: 'settingsService.getSettingValue',
  },
  async (keys) => {
    const key = keys[0].toString();
    const data = await chrome.storage.local.get(key);
    return [data[key]];
  }
);

const setSettingValue = async (key: string, value: any): Promise<void> => {
  if (isBackgroundServiceWorker) {
    if (value === null || value === undefined) {
      await chrome.storage.local.remove(key);
    } else {
      const set: { [key: string]: any } = {};
      set[key] = value;
      await chrome.storage.local.set(set);
    }
  } else {
    const response = await chrome.runtime.sendMessage({
      // Prefixed with the word "disconnected" so that the batchedPromise listener doesn't pick it up.
      disconnectedBackgroundServiceKey: 'settingsService.setSettingValue',
      key,
      value,
    });

    if (response.hasOwnProperty('error')) {
      throw response.error;
    }
  }
};

const getSettingValue = (key: string) => _getSettingValue(key);

if (isBackgroundServiceWorker) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      sender.id !== chrome.runtime.id ||
      message.disconnectedBackgroundServiceKey !==
        'settingsService.setSettingValue'
    ) {
      return;
    }

    setSettingValue(message.key, message.value)
      .then(() => {
        sendResponse({});
      })
      .catch((error) => {
        sendResponse({ error });
      });

    // Required for asynchronous callbacks
    // https://stackoverflow.com/a/20077854/1663648
    return true;
  });
}

// Export + attach to global
declare global {
  var settingsService: any;
}

globalThis.settingsService = { getSettingValue, setSettingValue };

export { getSettingValue, setSettingValue };
