import { sendMessage, addListener } from './messageService';

// Destination to be used with messaging.
const messageDestinationPrefix = 'settingsService';

// The message that actually gets sent to the background page.
type SettingsMessage = {
  // The setting key.
  key: string;

  // The setting value.
  value?: any;
};

// Fetches a locally stored setting value by its key.
const getSettingValue = (key: string): Promise<any> => {
  return sendMessage(`${messageDestinationPrefix}.getSettingValue`, {
    key,
  } as SettingsMessage);
};

// Locally stores a setting value.
const setSettingValue = (key: string, value: any): Promise<void> => {
  return sendMessage(`${messageDestinationPrefix}.setSettingValue`, {
    key,
    value,
  } as SettingsMessage);
};

const getValueFromLocalStorage = (key: string): any => {
  if (!localStorage.hasOwnProperty(key)) {
    return undefined;
  }

  try {
    const valueArray = JSON.parse(localStorage[key]);
    if (Array.isArray(valueArray) && valueArray.length > 0) {
      return valueArray[0];
    }

    console.warn(
      `Setting value in localStorage invalid: ${localStorage[key]} - removing it.`
    );
    localStorage.removeItem(key);
    return undefined;
  } catch (err) {
    console.warn(
      `Failed to parse '${key}' value from localStorage - removing it.`,
      err
    );
    localStorage.removeItem(key);
    return undefined;
  }
};

addListener(
  `${messageDestinationPrefix}.getSettingValue`,
  ({ key }: SettingsMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
      // chrome.storage APIs are callback-based until manifest V3.
      // Currently in migration phase, to migrate settings from localStorage -> chrome.storage.local
      const value = getValueFromLocalStorage(key);
      if (value !== undefined) {
        chrome.storage.local.set(
          {
            [key]: value,
          },
          () => {
            localStorage.removeItem(key);
            resolve(value);
          }
        );
      } else {
        chrome.storage.local.get(key, (values) => {
          resolve(values[key]);
        });
      }
    });
  }
);

addListener(
  `${messageDestinationPrefix}.setSettingValue`,
  ({ key, value }: SettingsMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
      // chrome.storage APIs are callback-based until manifest V3.
      // Currently in migration phase, to migrate settings from localStorage -> chrome.storage.local
      if (value === undefined) {
        chrome.storage.local.remove(key, () => {
          localStorage.removeItem(key);
          resolve(undefined);
        });
      } else {
        chrome.storage.local.set(
          {
            [key]: value,
          },
          () => {
            localStorage.removeItem(key);
            resolve(undefined);
          }
        );
      }
    });
  }
);

export { getSettingValue, setSettingValue };
