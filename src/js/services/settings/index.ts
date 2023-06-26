import { addListener, sendMessage } from '@tix-factory/extension-messaging';

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

// Gets a boolean setting value, toggled to false by default.
const getToggleSettingValue = async (key: string): Promise<boolean> => {
  const value = await getSettingValue(key);
  return !!value;
};

// Locally stores a setting value.
const setSettingValue = (key: string, value: any): Promise<void> => {
  return sendMessage(`${messageDestinationPrefix}.setSettingValue`, {
    key,
    value,
  } as SettingsMessage);
};

addListener(
  `${messageDestinationPrefix}.getSettingValue`,
  async ({ key }: SettingsMessage): Promise<any> => {
    const values = await chrome.storage.local.get(key);
    return values[key];
  },
  {
    levelOfParallelism: -1,
    allowExternalConnections: true,
  }
);

addListener(
  `${messageDestinationPrefix}.setSettingValue`,
  async ({ key, value }: SettingsMessage): Promise<any> => {
    if (value) {
      await chrome.storage.local.set({
        [key]: value,
      });
    } else {
      await chrome.storage.local.remove(key);
    }
  },
  {
    levelOfParallelism: -1,
    allowExternalConnections: true,
  }
);

export { getSettingValue, getToggleSettingValue, setSettingValue };
