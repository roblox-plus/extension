import { BatchedPromise } from '../utils/batchedPromise';
import { isBackgroundServiceWorker } from '../constants';
import {
  addMessageListener,
  broadcastMessage,
  sendMessage,
} from './extensionService';

const lastKnownValue: { [key: string]: any } = {};
const settingsChangeListener = new EventTarget();

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

    await broadcastMessage('settingsService.settingChanged', {
      key: key,
      value: value,
    });
  } else {
    await sendMessage('settingsService.setSettingValue', {
      key: key,
      value: value,
    });
  }
};

const getSettingValue = async (key: string): Promise<any> => {
  try {
    const value = await _getSettingValue(key);
    lastKnownValue[key] = value;
    return value;
  } catch (e) {
    // In case the extension disconnects.
    if (lastKnownValue.hasOwnProperty(key)) {
      return lastKnownValue[key];
    }

    // We tried.
    throw e;
  }
};

const getSettingValueAndListenForChanges = (
  key: string,
  callBack: (value: any) => Promise<void>
) => {
  settingsChangeListener.addEventListener(key, (event) => {
    if (event instanceof CustomEvent) {
      callBack(event.detail).catch((err) => {
        console.warn('Settings change handler failed', key, err);
      });
    }
  });

  getSettingValue(key)
    .then((value) => {
      callBack(value).catch((err) => {
        console.warn('Settings change handler failed', key, err);
      });
    })
    .catch((err) => {
      console.error('Failed to read initial setting value', key, err);
    });
};

if (isBackgroundServiceWorker) {
  addMessageListener('settingsService.setSettingValue', (message) =>
    setSettingValue(message.key, message.value)
  );
} else {
  addMessageListener('settingsService.settingChanged', async (message) => {
    lastKnownValue[message.key] = message.value;

    settingsChangeListener.dispatchEvent(
      new CustomEvent(message.key, {
        detail: message.value,
      })
    );
  });
}

// Export + attach to global
declare global {
  var settingsService: any;
}

globalThis.settingsService = {
  getSettingValue,
  getSettingValueAndListenForChanges,
  setSettingValue,
};

export { getSettingValue, getSettingValueAndListenForChanges, setSettingValue };
