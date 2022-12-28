import { BatchedPromise } from '../utils/batchedPromise';
import { isBackgroundServiceWorker } from '../constants';
import { addMessageListener, sendMessage } from './extensionService';

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
    await sendMessage('settingsService.setSettingValue', {
      key: key,
      value: value,
    });
  }
};

const getSettingValue = (key: string) => _getSettingValue(key);

if (isBackgroundServiceWorker) {
  addMessageListener('settingsService.setSettingValue', (message) =>
    setSettingValue(message.key, message.value)
  );
}

// Export + attach to global
declare global {
  var settingsService: any;
}

globalThis.settingsService = { getSettingValue, setSettingValue };

export { getSettingValue, setSettingValue };
