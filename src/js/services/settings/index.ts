import { isBackgroundServiceWorker } from '../constants';
import {
  addMessageListener,
  broadcastMessage,
  sendMessage,
} from './extensionService';

const lastKnownValue: { [key: string]: any } = {};
const settingsChangeListener = new EventTarget();

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
  if (isBackgroundServiceWorker) {
    const value = await chrome.storage.local.get(key);
    return value[key];
  } else {
    try {
      const value = await sendMessage('settingsService.getSettingValue', {
        key,
      });
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

  addMessageListener('settingsService.getSettingValue', (message) =>
    getSettingValue(message.key)
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

export { getSettingValue, getSettingValueAndListenForChanges, setSettingValue };
