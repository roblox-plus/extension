// We must import or export these values to ensure the content isn't thrown out.
import { manifest } from '../constants';
import { getSettingValue } from '../services/settingsService';
export * from './notifiers';

chrome.action.setTitle({
  title: `${manifest.name} ${manifest.version}`,
});

getSettingValue('startup-notification-enabled')
  .then((startupNotificationEnabled) => {
    console.log('hoopla', startupNotificationEnabled);
  })
  .catch(console.error);
