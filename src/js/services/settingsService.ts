import { sendMessage, addListener } from './messageService';

// Destination to be used with messaging.
const messageDestination = 'settingsService';

// The message that actually gets sent to the background page.
type SettingsMessage = {
  // The names of the methods that can be RPC'd.
  method: 'getSettingValue' | 'setSettingValue';

  // The setting key.
  key: string;

  // The setting value.
  value?: any;
};

const getSettingValue = (key: string): Promise<any> => {
  const method = 'getSettingValue';
  console.debug(`${messageDestination}.${method}`, key);

  return sendMessage(messageDestination, {
    method,
    key,
  } as SettingsMessage);
};

const setSettingValue = (key: string, value: any): Promise<void> => {
  const method = 'setSettingValue';
  console.debug(`${messageDestination}.${method}`, key, value);

  return sendMessage(messageDestination, {
    method,
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

addListener(messageDestination, (message: SettingsMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    // chrome.storage APIs are callback-based until manifest V3.
    // Currently in migration phase, to migrate settings from localStorage -> chrome.storage.local
    switch (message.method) {
      case 'getSettingValue':
        const value = getValueFromLocalStorage(message.key);
        if (value !== undefined) {
          chrome.storage.local.set(
            {
              [message.key]: value,
            },
            () => {
              localStorage.removeItem(message.key);
              resolve(value);
            }
          );
        } else {
          chrome.storage.local.get(message.key, (values) => {
            resolve(values[message.key]);
          });
        }

        return;
      case 'setSettingValue':
        if (message.value === undefined) {
          chrome.storage.local.remove(message.key, () => {
            localStorage.removeItem(message.key);
            resolve(undefined);
          });
        } else {
          chrome.storage.local.set(
            {
              [message.key]: message.value,
            },
            () => {
              localStorage.removeItem(message.key);
              resolve(undefined);
            }
          );
        }

        return;
      default:
        reject(`Unknown settings method: ${message.method}`);
        return;
    }
  });
});

export { getSettingValue, setSettingValue };
