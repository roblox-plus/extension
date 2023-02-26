// We must import or export these values to ensure the content isn't thrown out.
import { getSettingValue } from '../services/settingsService';
export * from '../browser-action';

getSettingValue('startup-notification-enabled')
  .then((startupNotificationEnabled) => {
    console.log('hoopla', startupNotificationEnabled);
  })
  .catch(console.error);