import { sendMessage } from '@tix-factory/extension-messaging';

const getSettingValue = async (settingName: string): Promise<any> => {
  return await sendMessage('settingsService.getSettingValue', {
    key: settingName,
  });
};

const getToggleSettingValue = async (settingName: string): Promise<boolean> => {
  const value = await getSettingValue(settingName);
  return !!value;
};

const setSettingValue = async (
  settingName: string,
  settingValue: any
): Promise<void> => {
  await sendMessage('settingsService.setSettingValue', {
    key: settingName,
    value: settingValue,
  });
};

export { getSettingValue, getToggleSettingValue, setSettingValue };
